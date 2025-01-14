import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { promises as fs } from 'fs';
import path from 'path';
import sharp from 'sharp';

export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        const card = await prisma.card.findUnique({
            where: { id: params.id }
        });
        
        if (!card) {
            return NextResponse.json({ error: "Carte non trouvée" }, { status: 404 });
        }

        return NextResponse.json(card);
    } catch (error) {
        return NextResponse.json({ error: "Erreur lors de la récupération de la carte" }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const { type, name, description, effect, image } = await request.json();
        let imageUrl = undefined; // undefined pour ne pas modifier l'image si pas de nouvelle image

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
                    .resize(800, 1200, {
                        fit: 'contain',
                        background: { r: 255, g: 255, b: 255, alpha: 0 }
                    })
                    .webp({ quality: 80 })
                    .toBuffer();

                // Supprimer l'ancienne image si elle existe
                const existingCard = await prisma.card.findUnique({
                    where: { id: params.id },
                    select: { image: true }
                });

                if (existingCard?.image) {
                    const oldImagePath = path.join(cardsDir, existingCard.image);
                    try {
                        await fs.unlink(oldImagePath);
                    } catch (error) {
                        console.error('Erreur lors de la suppression de l\'ancienne image:', error);
                    }
                }

                // Sauvegarder la nouvelle image
                const imageName = `${params.id}.webp`;
                const imagePath = path.join(cardsDir, imageName);
                await fs.writeFile(imagePath, optimizedImage);
                
                imageUrl = imageName;
            } catch (error) {
                console.error('Erreur lors du traitement de l\'image:', error);
                throw new Error('Erreur lors du traitement de l\'image');
            }
        }

        const updateData: any = {
            type,
            name,
            description,
            effect,
        };

        if (imageUrl !== undefined) {
            updateData.image = imageUrl;
        }

        const card = await prisma.card.update({
            where: { id: params.id },
            data: updateData
        });

        return NextResponse.json(card);
    } catch (error) {
        console.error('Erreur:', error);
        return NextResponse.json(
            { error: "Erreur lors de la mise à jour de la carte" },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        // Récupérer les informations de la carte avant la suppression
        const card = await prisma.card.findUnique({
            where: { id: params.id }
        });

        if (card?.image) {
            // Supprimer l'image associée
            const imagePath = path.join(process.cwd(), 'public', 'cards', card.image);
            try {
                await fs.unlink(imagePath);
            } catch (error) {
                console.error('Erreur lors de la suppression de l\'image:', error);
            }
        }

        // Supprimer la carte de la base de données
        await prisma.card.delete({
            where: { id: params.id }
        });

        return NextResponse.json({ message: "Carte supprimée avec succès" });
    } catch (error) {
        return NextResponse.json({ error: "Erreur lors de la suppression de la carte" }, { status: 500 });
    }
} 