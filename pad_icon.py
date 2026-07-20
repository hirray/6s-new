from PIL import Image

try:
    img = Image.open('sixs_logo.png')
    img = img.convert("RGBA")
    
    old_size = img.size
    # Increase the canvas size by 1.6x to give plenty of safe zone padding
    new_size = (int(old_size[0] * 1.6), int(old_size[1] * 1.6))
    
    # Create new image with a transparent background
    new_img = Image.new("RGBA", new_size, (255, 255, 255, 0))
    
    paste_pos = ((new_size[0] - old_size[0]) // 2, (new_size[1] - old_size[1]) // 2)
    new_img.paste(img, paste_pos, img)
    
    new_img.save('sixs_logo_padded.png')
    print("Success")
except Exception as e:
    print(f"Error: {e}")
