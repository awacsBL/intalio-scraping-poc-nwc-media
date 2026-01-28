input_file = "backup.sql"
output_file = "data_only.sql"

copying = False

with open(input_file, "r", encoding="utf-8") as infile, \
     open(output_file, "w", encoding="utf-8") as outfile:

    for line in infile:
        if line.startswith("COPY "):
            copying = True

        if copying:
            outfile.write(line)

        if copying and line.strip() == r"\.":
            copying = False
