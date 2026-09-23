from PIL import Image
from rembg import remove, new_session

input_path = r"d:\My Projects\Portfoliyo\public\krish.jpg"
output_path = r"d:\My Projects\Portfoliyo\public\krish.png"

# Use silueta model — only ~4MB, much faster to download than default u2net (1GB)
print("Loading silueta model (lightweight, ~4MB)...")
session = new_session("silueta")

print("Opening image:", input_path)
input_img = Image.open(input_path)

print("Removing background (person untouched, only bg removed)...")
output_img = remove(input_img, session=session)

print("Saving transparent PNG:", output_path)
output_img.save(output_path, format="PNG")

print("Done! Background removed successfully.")
