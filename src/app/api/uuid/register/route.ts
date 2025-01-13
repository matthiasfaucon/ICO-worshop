import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    const { uuid } = await req.json();

    if (!uuid) {
        return NextResponse.json({ message: "UUID manquant" }, { status: 400 });
    }

    console.log(uuid);

    return NextResponse.json({ message: "UUID enregistré avec succès" }, { status: 200 });
}
