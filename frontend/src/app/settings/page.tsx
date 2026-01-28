'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAppStore } from '@/store';
import { toast } from 'sonner';
import {
  Globe,
  Key,
  Brain,
  Server,
  Shield,
  Save,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';

export default function SettingsPage() {
  const { apiBaseUrl, setApiBaseUrl, proxies, setProxies, aiProvider, setAiProvider } =
    useAppStore();

  const [localApiUrl, setLocalApiUrl] = useState(apiBaseUrl);
  const [localProxies, setLocalProxies] = useState(proxies.join('\n'));
  const [openaiKey, setOpenaiKey] = useState('');
  const [huggingfaceKey, setHuggingfaceKey] = useState('');
  const [apifyKey, setApifyKey] = useState('');

  const [apiStatus, setApiStatus] = useState<'checking' | 'connected' | 'error' | null>(null);
  const [autoAnalysis, setAutoAnalysis] = useState(true);
  const [notifications, setNotifications] = useState(true);

  const handleSaveApiSettings = () => {
    setApiBaseUrl(localApiUrl);
    toast.success('API settings saved');
  };

  const handleSaveProxies = () => {
    const proxyList = localProxies
      .split('\n')
      .map((p) => p.trim())
      .filter((p) => p.length > 0);
    setProxies(proxyList);
    toast.success(`${proxyList.length} proxies saved`);
  };

  const handleTestConnection = async () => {
    setApiStatus('checking');
    try {
      const response = await fetch(`${localApiUrl}/`);
      if (response.ok) {
        setApiStatus('connected');
        toast.success('API connection successful');
      } else {
        setApiStatus('error');
        toast.error('API returned an error');
      }
    } catch {
      setApiStatus('error');
      toast.error('Could not connect to API');
    }
  };

  const handleSaveAISettings = () => {
    setAiProvider(aiProvider);
    toast.success('AI settings saved');
  };

  return (
    <>
      <Header
        title="Settings"
        subtitle="Configure your scraping and AI settings"
      />
      <div className="p-6 space-y-6 max-w-4xl">
        {/* API Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              API Configuration
            </CardTitle>
            <CardDescription>
              Configure the connection to your backend API
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="api-url">API Base URL</Label>
              <div className="flex gap-2">
                <Input
                  id="api-url"
                  placeholder="http://localhost:8000"
                  value={localApiUrl}
                  onChange={(e) => setLocalApiUrl(e.target.value)}
                  className="flex-1"
                />
                <Button variant="outline" onClick={handleTestConnection}>
                  {apiStatus === 'checking' ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    'Test'
                  )}
                </Button>
              </div>
              {apiStatus && (
                <div className="flex items-center gap-2 text-sm">
                  {apiStatus === 'connected' && (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-green-600">Connected</span>
                    </>
                  )}
                  {apiStatus === 'error' && (
                    <>
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span className="text-red-600">Connection failed</span>
                    </>
                  )}
                  {apiStatus === 'checking' && (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />
                      <span className="text-blue-600">Checking...</span>
                    </>
                  )}
                </div>
              )}
            </div>
            <Button onClick={handleSaveApiSettings}>
              <Save className="h-4 w-4 mr-2" />
              Save API Settings
            </Button>
          </CardContent>
        </Card>

        {/* Proxy Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Proxy Management
            </CardTitle>
            <CardDescription>
              Configure proxies for Instagram scraping to avoid rate limits
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="proxies">Proxy List</Label>
              <Textarea
                id="proxies"
                placeholder="http://user:pass@proxy1.example.com:8080&#10;http://user:pass@proxy2.example.com:8080&#10;..."
                value={localProxies}
                onChange={(e) => setLocalProxies(e.target.value)}
                rows={6}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Enter one proxy per line in the format: http://user:pass@host:port
              </p>
            </div>
            <div className="flex items-center justify-between">
              <Badge variant="secondary">
                {localProxies.split('\n').filter((p) => p.trim()).length} proxies
                configured
              </Badge>
              <Button onClick={handleSaveProxies}>
                <Save className="h-4 w-4 mr-2" />
                Save Proxies
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* AI Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              AI Configuration
            </CardTitle>
            <CardDescription>
              Configure AI models for sentiment analysis and content understanding
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>AI Provider</Label>
              <Select
                value={aiProvider}
                onValueChange={(value: 'openai' | 'huggingface' | 'local') =>
                  setAiProvider(value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="openai">OpenAI (GPT-4)</SelectItem>
                  <SelectItem value="huggingface">HuggingFace</SelectItem>
                  <SelectItem value="local">Local Model</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* API Keys */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">API Keys</h4>

              <div className="space-y-2">
                <Label htmlFor="openai-key">OpenAI API Key</Label>
                <div className="flex gap-2">
                  <Input
                    id="openai-key"
                    type="password"
                    placeholder="sk-..."
                    value={openaiKey}
                    onChange={(e) => setOpenaiKey(e.target.value)}
                  />
                  <Button variant="outline" size="icon">
                    <Key className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="huggingface-key">HuggingFace API Key</Label>
                <div className="flex gap-2">
                  <Input
                    id="huggingface-key"
                    type="password"
                    placeholder="hf_..."
                    value={huggingfaceKey}
                    onChange={(e) => setHuggingfaceKey(e.target.value)}
                  />
                  <Button variant="outline" size="icon">
                    <Key className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="apify-key">Apify API Key</Label>
                <div className="flex gap-2">
                  <Input
                    id="apify-key"
                    type="password"
                    placeholder="apify_api_..."
                    value={apifyKey}
                    onChange={(e) => setApifyKey(e.target.value)}
                  />
                  <Button variant="outline" size="icon">
                    <Key className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Required for Instagram scraping via Apify actors
                </p>
              </div>
            </div>

            <Button onClick={handleSaveAISettings}>
              <Save className="h-4 w-4 mr-2" />
              Save AI Settings
            </Button>
          </CardContent>
        </Card>

        {/* Automation Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Automation & Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto AI Analysis</Label>
                <p className="text-xs text-muted-foreground">
                  Automatically run AI analysis after scraping completes
                </p>
              </div>
              <Switch
                checked={autoAnalysis}
                onCheckedChange={setAutoAnalysis}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notifications</Label>
                <p className="text-xs text-muted-foreground">
                  Show browser notifications for job completions
                </p>
              </div>
              <Switch
                checked={notifications}
                onCheckedChange={setNotifications}
              />
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Danger Zone
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Clear All Data</p>
                <p className="text-sm text-muted-foreground">
                  Delete all scraped posts and comments from the database
                </p>
              </div>
              <Button variant="destructive">Clear Data</Button>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Reset Settings</p>
                <p className="text-sm text-muted-foreground">
                  Reset all settings to default values
                </p>
              </div>
              <Button variant="outline">Reset</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
