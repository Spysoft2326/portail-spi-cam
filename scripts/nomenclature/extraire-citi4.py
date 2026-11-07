# Extrait la structure détaillée de la CITI Rév.4 (texte du PDF ONU) en JSON :
# [{code, libelle, niveau: SECTION|DIVISION|GROUPE|CLASSE, parent}]
import re, json, sys
sys.stdout.reconfigure(encoding="utf-8")
lines = open(sys.argv[1], encoding="utf-8").read().splitlines()
start = next(i for i, l in enumerate(lines) if l.strip() == "Structure détaillée" and i > 2600)
end = next(i for i, l in enumerate(lines) if i > start + 50 and l.strip().startswith("Structure détaillée") and i > 3400)
skip = re.compile(r"^(=== PAGE|Classification internationale type|Division\s+Groupe\s+Classe|Section\s+Division|Structure générale et structure détaillée|Chapitre|\d+\s*$)")
items, cur, section, division, groupe = [], None, None, None, None

def add(code, lib, niveau, parent):
    global cur
    cur = {"code": code, "libelle": lib.strip(), "niveau": niveau, "parent": parent}
    items.append(cur)

i = start + 1
while i < end:
    l = lines[i].strip()
    i += 1
    if not l or skip.match(l):
        continue
    m = re.match(r"^Section\s+([A-Ua-u])\s*$", l)
    if m:
        section = m.group(1).upper()
        title = lines[i].strip(); i += 1
        add(section, title[:1].upper() + title[1:], "SECTION", None)
        continue
    m = re.match(r"^Divi[sa]ion\s+(\d{2})\d?\s+(.*)$", l)  # coquilles du PDF : "Diviaion 70", "Division 845"
    if m:
        division = m.group(1); add(division, m.group(2), "DIVISION", section); continue
    m = re.match(r"^(\d{3})\s+(\d{4})\s+(.*)$", l)
    if m:
        groupe = m.group(1)
        add(groupe, m.group(3), "GROUPE", division)
        add(m.group(2), m.group(3), "CLASSE", groupe)
        continue
    m = re.match(r"^(\d{3})\s+(\d{5})\s+(.*)$", l)   # coquille du PDF : "390 39000"
    if m:
        groupe = m.group(1)
        add(groupe, m.group(3), "GROUPE", division)
        add(m.group(2)[:4], m.group(3), "CLASSE", groupe)
        continue
    m = re.match(r"^(\d{4})\s+(.*)$", l)
    if m and m.group(1)[:2] == (division or ""):
        if m.group(1)[:3] != groupe:  # groupe omis dans le PDF (ex. 110, 170) : on le crée avec le libellé de la division
            groupe = m.group(1)[:3]
            add(groupe, next(x["libelle"] for x in reversed(items) if x["code"] == division and x["niveau"] == "DIVISION"), "GROUPE", division)
        add(m.group(1), m.group(2), "CLASSE", groupe); continue
    m = re.match(r"^(\d{3})\s+(.*)$", l)
    if m and m.group(1)[:2] == (division or ""):
        groupe = m.group(1); add(groupe, m.group(2), "GROUPE", division); continue
    if cur:  # suite du libellé sur la ligne suivante
        cur["libelle"] = (cur["libelle"] + " " + l).strip()

# Nettoyage des libellés (coupures de mots du PDF)
for it in items:
    it["libelle"] = re.sub(r"\s+", " ", it["libelle"]).replace("depétrole", "de pétrole").replace("planres", "plantes").strip(" ;,")
# Un groupe dont le libellé est identique à sa classe unique : on garde les deux (structure CITI)
counts = {n: sum(1 for x in items if x["niveau"] == n) for n in ["SECTION", "DIVISION", "GROUPE", "CLASSE"]}
print(counts)
codes = [x["code"] + x["niveau"] for x in items]
dups = {c for c in codes if codes.count(c) > 1}
print("doublons:", dups)
json.dump(items, open(sys.argv[2], "w", encoding="utf-8"), ensure_ascii=False, indent=0)
