-- Activer l'extension PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- Créer un index spatial sur la table Entreprise (sera créé après migration Prisma)
-- CREATE INDEX IF NOT EXISTS idx_entreprises_geom ON "Entreprise" USING GIST (geom);

-- Fonction pour mettre à jour automatiquement le geom à partir de lat/long
CREATE OR REPLACE FUNCTION update_entreprise_geom()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
    NEW.geom := ST_SetSRID(ST_MakePoint(NEW.longitude::float, NEW.latitude::float), 4326);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger (à activer après création de la table)
-- CREATE TRIGGER trigger_update_entreprise_geom
--   BEFORE INSERT OR UPDATE ON "Entreprise"
--   FOR EACH ROW
--   EXECUTE FUNCTION update_entreprise_geom();
