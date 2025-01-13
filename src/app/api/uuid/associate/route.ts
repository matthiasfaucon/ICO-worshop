import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    const { uuid, email, password } = await req.json();

    if (!uuid) {
        return NextResponse.json({ message: "UUID manquant" }, { status: 400 });
    }

    if (!email) {
        return NextResponse.json({ message: "Email manquant" }, { status: 400 });
    }

    if (!password) {
        return NextResponse.json({ message: "Mot de passe manquant" }, { status: 400 });
    }

    console.log(uuid, email, password);

    return NextResponse.json({ message: "Compte associé avec succès" }, { status: 200 });
}