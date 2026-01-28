import logging
from datetime import datetime
from sqlalchemy.orm import Session
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
from apscheduler.triggers.cron import CronTrigger
from app.database import SessionLocal
from app.models import JobSchedule

logger = logging.getLogger(__name__)

scheduler = BackgroundScheduler()

# Function mappings
def job_scrape_targets():
    from app.orchestrator import ScrapingOrchestrator
    logger.info("Scheduler: Executing job_scrape_targets")
    try:
        orchestrator = ScrapingOrchestrator()
        result = orchestrator.run_target_based_pipeline(
            limit_posts_per_target=10,
            max_posts_for_comments=20,
            limit_comments=10
        )
        logger.info(f"Scheduler: Scrape targets finished. New posts: {result['posts']['added']}, New comments: {result['comments'].get('comments_added', 0)}")
    except Exception as e:
        logger.error(f"Scheduler: Scrape targets failed: {e}")

def job_analyze_sentiment():
    from app.orchestrator import ScrapingOrchestrator
    logger.info("Scheduler: Executing job_analyze_sentiment")
    try:
        orchestrator = ScrapingOrchestrator()
        # Analyze 50 comments and 20 posts per run
        result_comments = orchestrator.analyze_all_comments_sentiment(batch_size=50)
        result_posts = orchestrator.analyze_all_posts_sentiment(batch_size=20)
        logger.info(f"Scheduler: Sentiment analysis finished. Comments: {result_comments.get('processed', 0)}, Posts: {result_posts.get('processed', 0)}")
    except Exception as e:
        logger.error(f"Scheduler: Sentiment analysis failed: {e}")

def job_weekly_report():
    from app.orchestrator import ScrapingOrchestrator
    logger.info("Scheduler: Generating weekly report")
    try:
        orchestrator = ScrapingOrchestrator()
        now = datetime.utcnow()
        # Get ISO calendar year and week
        year, week, _ = now.isocalendar()
        orchestrator.generate_weekly_report(year, week)
        logger.info(f"Scheduler: Weekly report updated for {year}-W{week}")
    except Exception as e:
        logger.error(f"Scheduler: Weekly report generation failed: {e}")

JOB_FUNCTIONS = {
    'scrape_targets': job_scrape_targets,
    'analyze_sentiment': job_analyze_sentiment,
    'weekly_report': job_weekly_report
}

DEFAULT_SCHEDULES = [
    {
        'job_id': 'scrape_targets',
        'name': 'Scrape Targets',
        'schedule_type': 'interval',
        'interval_minutes': 360, # 6 hours
        'hour': None, 'minute': None, 'day_of_week': None, 'day_of_month': None
    },
    {
        'job_id': 'analyze_sentiment',
        'name': 'Analyze Sentiment',
        'schedule_type': 'interval',
        'interval_minutes': 60, # 1 hour
        'hour': None, 'minute': None, 'day_of_week': None, 'day_of_month': None
    },
    {
        'job_id': 'weekly_report',
        'name': 'Generate Weekly Report',
        'schedule_type': 'interval',
        'interval_minutes': 720, # 12 hours
        'hour': None, 'minute': None, 'day_of_week': None, 'day_of_month': None
    }
]

def init_scheduler_jobs():
    """Initialize jobs from database or create defaults"""
    db = SessionLocal()
    try:
        for default in DEFAULT_SCHEDULES:
            job = db.query(JobSchedule).filter(JobSchedule.job_id == default['job_id']).first()
            if not job:
                logger.info(f"Creating default schedule for {default['job_id']}")
                job = JobSchedule(**default)
                db.add(job)
        db.commit()
        
        # Now load all jobs
        schedules = db.query(JobSchedule).all()
        for schedule in schedules:
            schedule_job(schedule)
            
    except Exception as e:
        logger.error(f"Error initializing scheduler: {e}")
    finally:
        db.close()

def schedule_job(schedule: JobSchedule):
    """Schedule a single job based on DB config"""
    # Remove existing job if present
    if scheduler.get_job(schedule.job_id):
        scheduler.remove_job(schedule.job_id)
        
    if not schedule.is_active:
        logger.info(f"Job {schedule.job_id} is inactive, skipping")
        return

    func = JOB_FUNCTIONS.get(schedule.job_id)
    if not func:
        logger.error(f"No function found for job_id {schedule.job_id}")
        return

    trigger = None
    if schedule.schedule_type == 'interval':
        minutes = schedule.interval_minutes or 60
        trigger = IntervalTrigger(minutes=minutes, start_date=datetime.now())
        logger.info(f"Scheduled {schedule.job_id} every {minutes} minutes")
        
    elif schedule.schedule_type == 'specific_time':
        # Cron trigger
        trigger = CronTrigger(
            hour=schedule.hour if schedule.hour is not None else '*',
            minute=schedule.minute if schedule.minute is not None else '0',
            day_of_week=schedule.day_of_week or '*',
            day=schedule.day_of_month or '*'
        )
        logger.info(f"Scheduled {schedule.job_id} at {schedule.hour}:{schedule.minute} (Dow: {schedule.day_of_week}, Day: {schedule.day_of_month})")
    
    if trigger:
        scheduler.add_job(
            func,
            trigger=trigger,
            id=schedule.job_id,
            name=schedule.name,
            replace_existing=True
        )

def update_job_schedule(job_id: str, updates: dict):
    """Update job schedule in DB and reschedule"""
    db = SessionLocal()
    try:
        job = db.query(JobSchedule).filter(JobSchedule.job_id == job_id).first()
        if not job:
            raise ValueError(f"Job {job_id} not found")
            
        for key, value in updates.items():
            if hasattr(job, key):
                setattr(job, key, value)
        
        db.commit()
        db.refresh(job)
        
        # Reschedule
        schedule_job(job)
        return job
        
    finally:
        db.close()

def trigger_now(job_id: str):
    """Trigger a job to run immediately"""
    job = scheduler.get_job(job_id)
    if job:
        job.modify(next_run_time=datetime.now())
        logger.info(f"Triggered immediate run for job {job_id}")
    else:
        logger.warning(f"Could not trigger job {job_id}: not found")

from apscheduler.events import EVENT_JOB_SUBMITTED, EVENT_JOB_EXECUTED, EVENT_JOB_ERROR
from app.models import JobExecution

RUNNING_JOBS = set()

def on_job_submitted(event):
    RUNNING_JOBS.add(event.job_id)
    # Record start
    db = SessionLocal()
    try:
        execution = JobExecution(
            job_id=event.job_id,
            status='running',
            started_at=datetime.utcnow()
        )
        db.add(execution)
        db.commit()
    except Exception as e:
        logger.error(f"Failed to record job start: {e}")
    finally:
        db.close()

def on_job_finished(event):
    RUNNING_JOBS.discard(event.job_id)
    # Record finish
    db = SessionLocal()
    try:
        # Find latest running execution for this job
        execution = db.query(JobExecution).filter(
            JobExecution.job_id == event.job_id, 
            JobExecution.status == 'running'
        ).order_by(JobExecution.started_at.desc()).first()
        
        if execution:
            execution.completed_at = datetime.utcnow()
            
            if event.exception:
                execution.status = 'failed'
                execution.error_message = str(event.exception)
            else:
                execution.status = 'completed'
                # Attempt to get result if available (APScheduler events generally don't carry return values easily without custom listeners or job stores, 
                # but we can assume success for now or try to fetch from somewhere if we stored it globally. 
                # For simplicity, we just mark completed.)
            
            db.commit()
    except Exception as e:
        logger.error(f"Failed to record job finish: {e}")
    finally:
        db.close()

def start_scheduler():
    if not scheduler.running:
        init_scheduler_jobs()
        
        # Add listeners
        scheduler.add_listener(on_job_submitted, EVENT_JOB_SUBMITTED)
        scheduler.add_listener(on_job_finished, EVENT_JOB_EXECUTED | EVENT_JOB_ERROR)
        
        scheduler.start()
        logger.info("Scheduler started with DB configuration")

def stop_scheduler():
    if scheduler.running:
        scheduler.shutdown()
        logger.info("Scheduler stopped")

def get_job_history(limit: int = 50):
    """Get recent job execution history"""
    db = SessionLocal()
    try:
        history = db.query(JobExecution).order_by(JobExecution.started_at.desc()).limit(limit).all()
        return [{
            'id': h.id,
            'job_id': h.job_id,
            'status': h.status,
            'started_at': h.started_at.isoformat() + 'Z',
            'completed_at': h.completed_at.isoformat() + 'Z' if h.completed_at else None,
            'error_message': h.error_message,
            'target': determine_job_name(h.job_id), # Helper to get friendly name
            'type': determine_job_type(h.job_id)
        } for h in history]
    finally:
        db.close()

def determine_job_name(job_id):
    # Quick lookup or DB lookup
    # Since we can't easily query JobSchedule inside the list compr without N+1, we'll try a simple mapping or cache
    # For now, simplistic mapping based on known IDs
    if job_id == 'scrape_targets': return 'Scrape Targets'
    if job_id == 'analyze_sentiment': return 'Analyze Sentiment'
    if job_id == 'weekly_report': return 'Generate Weekly Report'
    return job_id

def get_jobs_status():
    """Return status of all scheduled jobs formatted for frontend"""
    # Combine DB config with runtime status
    db = SessionLocal()
    try:
        db_jobs = {j.job_id: j for j in db.query(JobSchedule).all()}
        
        jobs = []
        for job_id, config in db_jobs.items():
            runtime_job = scheduler.get_job(job_id)
            
            # Determine status
            status = "inactive"
            if runtime_job:
                if job_id in RUNNING_JOBS:
                    status = "running"
                else:
                    status = "queued"
            
            jobs.append({
                "id": config.job_id,
                "name": config.name,
                "type": determine_job_type(config.job_id),
                "is_active": config.is_active,
                "schedule_type": config.schedule_type,
                "interval_minutes": config.interval_minutes,
                "config": {
                    "hour": config.hour,
                    "minute": config.minute,
                    "day_of_week": config.day_of_week,
                    "day_of_month": config.day_of_month
                },
                "target": config.name,
                "status": status,
                "started_at": datetime.utcnow().isoformat() + 'Z',
                "next_run": (runtime_job.next_run_time.isoformat() if runtime_job and runtime_job.next_run_time else None)
            })
        return jobs
    finally:
        db.close()

def determine_job_type(job_id):
    if 'scrape' in job_id:
        return 'full_pipeline'
    if 'sentiment' in job_id:
        return 'discovery' 
    if 'report' in job_id:
        return 'comments'
    return 'full_pipeline'
