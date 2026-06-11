// Dans la fonction POST, remplacer la validation :

// AVANT (bug : password obligatoire)
if (!name || !email || !password) {
  return NextResponse.json({ error: "Tous les champs sont requis" }, { status: 400 });
}

// APRÈS (génère un mot de passe si absent)
if (!name || !email) {
  return NextResponse.json({ error: "Nom et email sont requis" }, { status: 400 });
}

// Générer un mot de passe par défaut si non fourni
const userPassword = password || `Temp${Date.now()}`;
const hashedPassword = await bcrypt.hash(userPassword, 10);

// Et dans le return, ajouter generatedPassword si auto-généré :
const response: any = {
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
};

if (!password) {
  response.generatedPassword = userPassword;
}

return NextResponse.json(response, { status: 201 });