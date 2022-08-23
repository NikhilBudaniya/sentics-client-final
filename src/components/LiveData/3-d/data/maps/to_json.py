import json

# config
NAME = "ags"

# open file
f_in = open(f"{NAME}.csv", "r")

# create output structure
output = {
    "name": NAME,
    "points": []       
}

# read lines
lines = 0
for line in f_in:
    x, y, z = line.rstrip().split(";")
    output["points"].append([float(x), float(y), float(z)])
    lines += 1

# write to json
with open(f"{NAME}.json", 'w') as f_out:
    json.dump(output, f_out, indent=4)

print(f"[INFO] successfully parsed {lines}.")


