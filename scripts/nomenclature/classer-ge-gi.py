# Classement BROUILLON des grandes industries (feuille GE-GI) en classes CITI Rév.4.
# Règles par mots-clés sur l'activité déclarée, puis corrections nominatives connues.
# Sortie : CSV de revue (sans téléphone) + CSV enrichi pour l'import local.
import csv, json, re, sys, unicodedata
sys.stdout.reconfigure(encoding="utf-8")
src, citi_path, out_review, out_import = sys.argv[1:5]
citi = {x["code"]: x for x in json.load(open(citi_path, encoding="utf-8"))}
fil = json.load(open(sys.argv[5], encoding="utf-8"))["filieres"]

def norm(s):
    return unicodedata.normalize("NFD", s or "").encode("ascii", "ignore").decode().upper()

# (regex sur activité normalisée, code CITI, confiance)
RULES = [
    (r"ACHAT.*(CACAO|CAFE)|(CACAO|CAFE).*EXPORT|ACHAT ET VENTE.*CACAO", "4620", "haute"),
    (r"TRANSFORMATION.*CACAO|CHOCOLAT|CONFISERIE|PRODUCTION & TRANSFORMATION CACAO", "1073", "haute"),
    (r"BOUL[A]?N?GERIE|PATISSERIE|BISCUIT", "1071", "haute"),
    (r"BRASS|BIERE", "1103", "haute"),
    (r"VINS?\b|SPIRITUEUX", "1102", "moyenne"),
    (r"EAU MINERALE", "1104", "haute"),
    (r"PATES", "1074", "haute"),
    (r"FARINE|BLE\b|CEREA|MOULIN", "1061", "haute"),
    (r"LAIT", "1050", "haute"),
    (r"PROVENDE|ALIMENTS? P", "1080", "haute"),
    (r"OLEAGINEUX|HUILE|MARGARINE", "1040", "haute"),
    (r"SUCRE", "1072", "haute"),
    (r"\bSEL\b", "1079", "moyenne"),
    (r"USINE A CAFE", "1079", "moyenne"),
    (r"ENGRAIS", "2012", "haute"),
    (r"HEVEA", "0129", "moyenne"),
    (r"PHYTO", "2021", "haute"),
    (r"SAVON|DETERGENT|DENTIFRICE|COSMETIQ", "2023", "haute"),
    (r"PEINTURE", "2022", "haute"),
    (r"PRODUITS CHIMIQUES|CHIMI", "2029", "basse"),
    (r"EMBALLAGE.*PLASTIQ|BOUTEILLE PLASTIQ|PLASTIQ|MOUSSE", "2220", "haute"),
    (r"EMBALLAGE", "1702", "basse"),
    (r"CIMENT", "2394", "haute"),
    (r"VERRE", "2310", "haute"),
    (r"MATERIEL DE CONSTRUCTION", "2395", "moyenne"),
    (r"ALUM", "2420", "haute"),
    (r"ACIER|METAUX|METALLIQUES DE BASE|METALLURGIE", "2410", "moyenne"),
    (r"TUBES", "2410", "moyenne"),
    (r"CONSTRUCTION METALLIQUE", "2511", "haute"),
    (r"SCIERIE|SCIAGE|TRANSFORMATION (DE |DU )?BOIS|TRANSFORMATION GRUMES|PLACAGE", "1610", "moyenne"),
    (r"FOREST|FORET|EXPLOITANT|SYLVICULTURE", "0220", "moyenne"),
    (r"MANUTENTION GRUMES", "5224", "moyenne"),
    (r"IMPRIM|SERIGRAPH", "1811", "haute"),
    (r"CAHIER|CELLULOSE", "1709", "moyenne"),
    (r"TISSU|COTON", "1311", "moyenne"),
    (r"CENTRAL HYDRO|PRODUCTION ET DISTRIBUTION (ELECTRIQ|ENERGIE)", "3510", "haute"),
    (r"ELECTRICITE INDUSTRIELLE", "4321", "moyenne"),
    (r"EQUIP", "2829", "basse"),
    (r"RAFFINAGE PETROLE", "1920", "haute"),
    (r"GAZ NATUREL", "0620", "haute"),
    (r"EXPLORATION MINIERE ET PETROLIERE", "0910", "moyenne"),
    (r"EXPLORATION|EXPLOITATION.*HYDROCARBURE|EXPLOITATION PETROL|EXTRACTION HYDROCARBURE|AMONT DE PETROLE|BUSINESS OF OIL", "0610", "moyenne"),
    (r"TRANSPORT HYDROCARBURE", "4930", "haute"),
    (r"TRAITEMENT HYDROCARBURES|ANALYSES", "7120", "basse"),
    (r"GAZ INDUSTRIEL", "2011", "moyenne"),
    (r"PRODUCTION ET COMMERCE DE GAZ", "1920", "basse"),
    (r"DISTRIBUTION.*PETROL|DISTRIBUTION HYDROCARBURE", "4661", "haute"),
    (r"ENTREPOSAGE", "5210", "haute"),
    (r"SERVICES AUX ENTREPRISES", "0910", "basse"),
    (r"SUPERMARCHE", "4711", "haute"),
    (r"REMORQUAGE|LAMANAGE", "5222", "haute"),
    (r"FERROVIAIRE", "4912", "haute"),
    (r"REPARATION NAVIRES", "3315", "haute"),
    (r"MAINTENANCE INDUSTRIELLE", "3312", "moyenne"),
    (r"DRAGAGE", "4290", "haute"),
    (r"CONCESSIONNAIRE", "4510", "haute"),
    (r"MANUTENTION", "5224", "haute"),
    (r"\bBTP\b|BATIMENT|TRAVAUX PUB", "4290", "basse"),
]
# Corrections nominatives (activité déclarée trop vague ou trompeuse)
OVERRIDES = {
    "LE PLASTIQUE CAMEROUNAIS": ("2220", "moyenne", "Emballages plastiques (filière du fichier : Emballages)"),
    "PARCS A BOIS": ("5224", "moyenne", "Manutention de grumes : service logistique de la filière bois, hors champ industriel"),
    "FERRERO": ("1073", "haute", "Classé « Serviettes hygiéniques » dans le fichier : Ferrero fabrique des produits chocolatés"),
    "CAMEROON DEVELOPMENT CORPORATION": ("0126", "moyenne", "Plantations (palmier, hévéa, banane) avec transformation : activité principale à confirmer"),
    "HEVEA DU CAMEROUN": ("0129", "moyenne", "Hévéaculture avec usine de caoutchouc : CITI 0129 (culture) ou 2219 (transformation) à arbitrer"),
    "SOACAM": ("1062", "basse", "Activité « agro-industrie » trop vague"),
    "NEW FOODS": ("1079", "basse", "Activité « agro-alimentaire » trop vague"),
    "PANZANI": ("1074", "moyenne", "Pâtes alimentaires"),
    "HUILERIE ALIMENTAIRE": ("1040", "moyenne", ""),
    "SOCIETE AFRICAINE FORESTIERE": ("1040", "basse", "Nom « forestière » mais activité « production des huiles »"),
    "LES CIMENTERIES D'AFRIQUE": ("2394", "moyenne", "Classé Chimie dans le fichier : cimenterie"),
    "ATLAS NEGOCE": ("2029", "basse", ""),
    "SEP RAZEL": ("4210", "moyenne", "BTP classé « Mines-Métallurgie » dans le fichier"),
    "SOGEA": ("4290", "moyenne", "BTP classé « Mines-Métallurgie » dans le fichier"),
    "CONFECTION EXPRESS": ("1410", "basse", "Nom « confection » mais activité « BTP / PS » : à vérifier"),
    "SIEMENS": ("3320", "basse", "Fabrication et installation d'équipements : installation (3320) probable"),
    "CAMEROON OIL TERMINAL": ("5210", "moyenne", "Terminal pétrolier : entreposage"),
    "SOCIETE NATIONALE DE RAFFINERI": ("1920", "haute", "SONARA"),
    "COMPLEXE MULTI-INDUSTRIEL": ("2420", "moyenne", ""),
    "KALFRELEC": ("4321", "basse", ""),
    "CHINA INTER WATER": ("4220", "moyenne", ""),
    "LA REGIE DELEGUEE DU DRAGAGE": ("4290", "haute", ""),
    "AIR LIQUIDE": ("2011", "haute", "Gaz industriels : chimie de base (2011), pas hydrocarbures"),
    "INDUSTRIE DES CRAYONS": ("3290", "moyenne", "Fournitures scolaires"),
    "SOCIETE DES PRODUITS NOUVEAUX": ("2220", "basse", ""),
    "SOCIETE DE DEVELOPPEMENT DU CO": ("0116", "moyenne", "SODECOTON : culture et égrenage du coton (0116 / 0163)"),
}

def filiere(code):
    best = None
    for f in fil:
        for p in f["prefixes"]:
            if code.startswith(p) and (best is None or len(p) > len(best[1])):
                best = (f, p)
    return best[0] if best else None

def section(code):
    c = citi.get(code)
    while c and c["niveau"] != "SECTION":
        c = citi.get(c["parent"])
    return c["code"] if c else "?"

rows = list(csv.DictReader(open(src, encoding="utf-8"), delimiter=";"))
review, imp, stats = [], [], {"haute": 0, "moyenne": 0, "basse": 0, "non classé": 0}
for r in rows:
    act, nom = norm(r["activite"]), norm(r["raison_sociale"])
    code, conf, rem = None, "non classé", ""
    for key, (c, cf, rm) in OVERRIDES.items():
        if norm(key) in nom:
            code, conf, rem = c, cf, rm
            break
    if not code:
        for pat, c, cf in RULES:
            if re.search(pat, act):
                code, conf = c, cf
                break
    if code and code not in citi:
        raise SystemExit(f"code CITI inconnu {code} pour {r['raison_sociale']}")
    f = filiere(code) if code else None
    sec = section(code) if code else ""
    if code and not rem:
        ff = norm(r["filiere_fichier"]).replace("_", " ")
        if f and ff and ff[:4] not in norm(f["libelle"]).replace("-", " ") and ff not in ("AUTRE",):
            rem = f"Filière du fichier : {r['filiere_fichier']}"
    stats[conf] += 1
    champ = "oui" if sec in ("B", "C", "D", "E") else "non"
    review.append({
        "num": r["num"], "raison_sociale": r["raison_sociale"], "sigle": r["sigle"],
        "activite_declaree": r["activite"], "filiere_fichier": r["filiere_fichier"],
        "code_citi_propose": code or "", "libelle_citi": citi[code]["libelle"] if code else "",
        "section": sec, "champ_industriel": champ,
        "filiere_proposee": f["libelle"] if f else "", "confiance": conf, "remarque": rem,
    })
    imp.append({**r, "code_citi": code or "", "filiere": f["code"] if f else "", "confiance": conf})

for path, data in ((out_review, review), (out_import, imp)):
    with open(path, "w", encoding="utf-8-sig", newline="") as fh:
        w = csv.DictWriter(fh, fieldnames=list(data[0].keys()), delimiter=";")
        w.writeheader(); w.writerows(data)

print("Confiance :", stats)
import collections
print("Champ industriel :", collections.Counter(x["champ_industriel"] for x in review))
print("Filières proposées :", collections.Counter(x["filiere_proposee"] or "(aucune)" for x in review).most_common())
print("\nChangements de filière par rapport au fichier :")
for x in review:
    if x["remarque"]: print(f"  {x['num']:>3} {x['raison_sociale'][:34]:34} {x['code_citi_propose']} -> {x['filiere_proposee'][:28]:28} | {x['remarque'][:80]}")
