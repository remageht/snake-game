import math
from PIL import Image, ImageDraw

def create_snake_icon(size=1024, output_path="app-icon.png"):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Background rounded rectangle
    margin = int(size * 0.04)
    radius = int(size * 0.22)
    bg_box = [margin, margin, size - margin, size - margin]
    draw.rounded_rectangle(bg_box, radius=radius, fill=(24, 28, 36, 255))
    
    # Subtle inner gradient / border
    border_width = int(size * 0.02)
    draw.rounded_rectangle(bg_box, radius=radius, outline=(76, 175, 80, 180), width=border_width)

    # Grid effect in background
    grid_color = (35, 42, 54, 255)
    step = int(size * 0.08)
    for x in range(margin + radius, size - margin - radius, step):
        draw.line([(x, margin + border_width), (x, size - margin - border_width)], fill=grid_color, width=2)
    for y in range(margin + radius, size - margin - radius, step):
        draw.line([(margin + border_width, y), (size - margin - border_width, y)], fill=grid_color, width=2)

    # Draw Apple (food)
    apple_center_x = int(size * 0.72)
    apple_center_y = int(size * 0.35)
    apple_r = int(size * 0.12)
    # Apple shadow
    draw.ellipse([apple_center_x - apple_r + 4, apple_center_y - apple_r + 6,
                  apple_center_x + apple_r + 4, apple_center_y + apple_r + 6], fill=(10, 10, 10, 120))
    # Red body
    draw.ellipse([apple_center_x - apple_r, apple_center_y - apple_r,
                  apple_center_x + apple_r, apple_center_y + apple_r], fill=(239, 68, 68, 255))
    # Leaf
    leaf_pts = [
        (apple_center_x, apple_center_y - apple_r),
        (apple_center_x + int(apple_r * 0.6), apple_center_y - int(apple_r * 1.5)),
        (apple_center_x - int(apple_r * 0.1), apple_center_y - int(apple_r * 1.3))
    ]
    draw.polygon(leaf_pts, fill=(34, 197, 94, 255))

    # Snake body segments (S-shape / coil)
    body_radius = int(size * 0.075)
    body_coords = [
        (int(size * 0.28), int(size * 0.75)),
        (int(size * 0.38), int(size * 0.75)),
        (int(size * 0.48), int(size * 0.75)),
        (int(size * 0.58), int(size * 0.72)),
        (int(size * 0.64), int(size * 0.64)),
        (int(size * 0.64), int(size * 0.54)),
        (int(size * 0.56), int(size * 0.46)),
        (int(size * 0.46), int(size * 0.46)),
        (int(size * 0.36), int(size * 0.46)),
        (int(size * 0.30), int(size * 0.38)),
        (int(size * 0.32), int(size * 0.28)),
        (int(size * 0.44), int(size * 0.26)),
    ]

    # Draw segments with 3D green gradient style
    green_start = (34, 197, 94)
    green_end = (74, 222, 128)
    n = len(body_coords)

    for i, (bx, by) in enumerate(body_coords):
        t = i / max(1, n - 1)
        r = int(green_start[0] + (green_end[0] - green_start[0]) * t)
        g = int(green_start[1] + (green_end[1] - green_start[1]) * t)
        b = int(green_start[2] + (green_end[2] - green_start[2]) * t)
        
        # Shadow
        draw.ellipse([bx - body_radius + 4, by - body_radius + 6,
                      bx + body_radius + 4, by + body_radius + 6], fill=(0, 0, 0, 80))
        # Body segment
        draw.ellipse([bx - body_radius, by - body_radius,
                      bx + body_radius, by + body_radius], fill=(r, g, b, 255))
        # Highlight
        hl_r = int(body_radius * 0.4)
        draw.ellipse([bx - int(body_radius * 0.4), by - int(body_radius * 0.4),
                      bx - int(body_radius * 0.4) + hl_r, by - int(body_radius * 0.4) + hl_r],
                     fill=(255, 255, 255, 90))

    # Snake Head
    head_x, head_y = body_coords[-1]
    head_r = int(body_radius * 1.25)
    draw.ellipse([head_x - head_r, head_y - head_r, head_x + head_r, head_y + head_r], fill=(74, 222, 128, 255))

    # Eyes
    eye_r = int(head_r * 0.28)
    draw.ellipse([head_x + int(head_r * 0.2), head_y - int(head_r * 0.35),
                  head_x + int(head_r * 0.2) + eye_r, head_y - int(head_r * 0.35) + eye_r], fill=(255, 255, 255, 255))
    draw.ellipse([head_x + int(head_r * 0.32), head_y - int(head_r * 0.3),
                  head_x + int(head_r * 0.32) + int(eye_r * 0.5), head_y - int(head_r * 0.3) + int(eye_r * 0.5)], fill=(10, 10, 10, 255))

    # Tongue
    tx = head_x + head_r
    ty = head_y
    tongue_pts = [
        (tx - 2, ty),
        (tx + int(head_r * 0.5), ty - int(head_r * 0.15)),
        (tx + int(head_r * 0.7), ty - int(head_r * 0.3)),
        (tx + int(head_r * 0.55), ty - int(head_r * 0.1)),
        (tx + int(head_r * 0.7), ty + int(head_r * 0.05)),
        (tx + int(head_r * 0.45), ty),
        (tx - 2, ty + 4)
    ]
    draw.polygon(tongue_pts, fill=(239, 68, 68, 255))

    img.save(output_path, "PNG")
    print(f"Icon generated at {output_path}")

if __name__ == "__main__":
    create_snake_icon()
