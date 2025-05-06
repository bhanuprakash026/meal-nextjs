import fs from 'fs'
import sql from "better-sqlite3";
import slugify from "slugify";
import xss from "xss";
const db = sql('meals.db');
import path from 'path';

export async function getMeals() {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return db.prepare('SELECT * FROM meals').all();
}

export function getMeal(slug) {
    return db.prepare('SELECT * FROM meals WHERE slug = ?').get(slug);
}

export async function saveMeal(meal) {
    // Generate slug and sanitize instructions
    meal.slug = meal.slug = `${meal.slug}-${Date.now()}`
    meal.instructions = xss(meal.instructions);

    // Ensure meal.image is a File object with .name and .arrayBuffer
    if (!meal.image?.name || !meal.image?.arrayBuffer) {
        throw new Error("Invalid image upload.");
    }

    // Extract file extension
    const extension = meal.image.name.split('.').pop();
    const fileName = `${meal.slug}.${extension}`;

    // Ensure the /public/images directory exists
    const imageDir = path.join(process.cwd(), 'public', 'images');
    if (!fs.existsSync(imageDir)) {
        fs.mkdirSync(imageDir, { recursive: true });
    }

    // Create full path to save the image
    const filePath = path.join(imageDir, fileName);

    // Write image buffer to file
    const bufferedImage = await meal.image.arrayBuffer();
    const stream = fs.createWriteStream(filePath);
    
    await new Promise((resolve, reject) => {
        stream.write(Buffer.from(bufferedImage), (error) => {
            if (error) {
                reject(new Error("Saving image failed: " + error.message));
            } else {
                resolve();
            }
        });
    });

    // Set relative image path for storing in DB
    meal.image = `/images/${fileName}`;

    // Insert into the database
    db.prepare(`
        INSERT INTO meals
            (title, summary, instructions, creator, creator_email, image, slug) 
        VALUES (
            @title,
            @summary,
            @instructions,
            @creator,
            @creator_email,
            @image,
            @slug
        )
    `).run(meal);
}


