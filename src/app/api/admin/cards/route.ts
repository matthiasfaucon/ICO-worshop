import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { promises as fs } from 'fs';
import path from 'path';
import sharp from 'sharp';

export async function GET() {
    try {
        const cards = await prisma.card.findMany();
        return NextResponse.json(cards);
    } catch (error) {
        return NextResponse.json({ error: "Erreur lors de la récupération des cartes" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { type, name, description, effect, image } = await request.json();
        const id = crypto.randomUUID();
        let imageUrl = null;

        if (image) {
            try {
                // Créer le dossier cards s'il n'existe pas
                const publicDir = path.join(process.cwd(), 'public');
                const cardsDir = path.join(publicDir, 'cards');
                await fs.mkdir(cardsDir, { recursive: true });

                // Convertir le Base64 en buffer
                const imageBuffer = Buffer.from(image, 'base64');

                // Utiliser Sharp pour optimiser et convertir l'image en WebP
                const optimizedImage = await sharp(imageBuffer)
                    .resize(800, 1200, { // Dimensions adaptées à vos cartes
                        fit: 'contain',
                        background: { r: 255, g: 255, b: 255, alpha: 0 }
                    })
                    .webp({ quality: 80 })
                    .toBuffer();

                // Sauvegarder l'image
                const imageName = `${id}.webp`;
                const imagePath = path.join(cardsDir, imageName);
                await fs.writeFile(imagePath, optimizedImage);
                
                imageUrl = imageName;
            } catch (error) {
                console.error('Erreur lors du traitement de l\'image:', error);
                throw new Error('Erreur lors du traitement de l\'image');
            }
        }

        const card = await prisma.card.create({
            data: {
                id,
                type,
                name,
                description,
                effect,
                image: imageUrl
            }
        });

        return NextResponse.json(card);
    } catch (error) {
        console.error('Erreur:', error);
        return NextResponse.json(
            { error: "Erreur lors de la création de la carte" },
            { status: 500 }
        );
    }
}