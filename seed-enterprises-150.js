const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const enterprises = [
  // ==================== AGRICULTURE & AGROALIMENTAIRE (30) ====================
  { name: "Société de Développement du Coton (SODECOTON)", sector: "Agriculture", city: "Garoua", region: "Nord", employees: 2500, website: "www.sodecoton.com", description: "Leader du coton au Cameroun, filiale de la CDC" },
  { name: "Plantations du Haut Penja (PHP)", sector: "Agriculture", city: "Penja", region: "Littoral", employees: 3200, website: "www.php-cam.com", description: "Premier producteur mondial de bananes Penja AOP" },
  { name: "Boh Plantations", sector: "Agriculture", city: "Tiko", region: "Sud-Ouest", employees: 1800, website: "www.bohplantations.com", description: "Production de thé et d'huile de palme depuis 1914" },
  { name: "CAMSUCO (Cameroon Sugar Company)", sector: "Agriculture", city: "Mbandjock", region: "Centre", employees: 2100, website: "www.camsuco.com", description: "Principal producteur de sucre du Cameroun" },
  { name: "Pamol Plantations Ltd", sector: "Agriculture", city: "Lobe", region: "Sud-Ouest", employees: 1500, website: "www.pamol.com", description: "Production d'huile de palme et de caoutchouc" },
  { name: "Société Africaine Forestière et Agricole du Cameroun (SAFACAM)", sector: "Agriculture", city: "Douala", region: "Littoral", employees: 1200, website: "www.safacam.com", description: "Hévéaculture et palmeraies industrielles" },
  { name: "CDC (Cameroon Development Corporation)", sector: "Agriculture", city: "Buea", region: "Sud-Ouest", employees: 15000, website: "www.cdc-cameroon.com", description: "Plus grande entreprise agricole du Cameroun" },
  { name: "Société Camerounaise de Palmeraies (SOCAPALM)", sector: "Agriculture", city: "Douala", region: "Littoral", employees: 2800, website: "www.socapalm.com", description: "Production d'huile de palme raffinée" },
  { name: "Cargill Cameroun", sector: "Agroalimentaire", city: "Douala", region: "Littoral", employees: 450, website: "www.cargill.com", description: "Négociant international de cacao et café" },
  { name: "Olam Cameroun", sector: "Agroalimentaire", city: "Douala", region: "Littoral", employees: 600, website: "www.olamgroup.com", description: "Transformation de cacao et noix de cajou" },
  { name: "Barry Callebaut Cameroun", sector: "Agroalimentaire", city: "Douala", region: "Littoral", employees: 380, website: "www.barry-callebaut.com", description: "Usine de transformation de cacao en beurre" },
  { name: "Chococam (Mondelez International)", sector: "Agroalimentaire", city: "Douala", region: "Littoral", employees: 520, website: "www.mondelezinternational.com", description: "Fabrication de chocolat et confiseries" },
  { name: "Les Brasseries du Cameroun (SABC)", sector: "Agroalimentaire", city: "Douala", region: "Littoral", employees: 2800, website: "www.sabc.cm", description: "Leader brassicole, filiale de Castel Group" },
  { name: "Guinness Cameroun (Diageo)", sector: "Agroalimentaire", city: "Douala", region: "Littoral", employees: 650, website: "www.diageo.com", description: "Production de bières et spiritueux" },
  { name: "Nestlé Cameroun", sector: "Agroalimentaire", city: "Douala", region: "Littoral", employees: 480, website: "www.nestle.cm", description: "Produits alimentaires et nutrition infantile" },
  { name: "Société Nouvelle des Huileries du Cameroun (SNH)", sector: "Agroalimentaire", city: "Douala", region: "Littoral", employees: 320, website: "www.snh-cameroun.com", description: "Raffinage d'huiles végétales" },
  { name: "Camlait (Groupe Lactalis)", sector: "Agroalimentaire", city: "Douala", region: "Littoral", employees: 890, website: "www.camlait.com", description: "Premier laitier du Cameroun, yaourts et fromages" },
  { name: "Ferme Agro-Pastorale de Kekem (FAPK)", sector: "Agriculture", city: "Kekem", region: "Ouest", employees: 200, website: "", description: "Élevage bovin et production laitière" },
  { name: "Société d'Exploitation des Etablissements Boulanger (SEEB)", sector: "Agroalimentaire", city: "Yaoundé", region: "Centre", employees: 350, website: "www.seeb-cm.com", description: "Boulangerie industrielle et pâtisserie" },
  { name: "Azur S.A.", sector: "Agroalimentaire", city: "Douala", region: "Littoral", employees: 280, website: "www.azur-sa.com", description: "Production de jus et boissons non alcoolisées" },
  { name: "Maison Kayser Cameroun", sector: "Agroalimentaire", city: "Yaoundé", region: "Centre", employees: 120, website: "", description: "Boulangerie artisanale de luxe" },
  { name: "Société de Transformation Alimentaire du Cameroun (STAC)", sector: "Agroalimentaire", city: "Douala", region: "Littoral", employees: 180, website: "", description: "Transformation de fruits tropicaux" },
  { name: "Ferme Suisse du Cameroun", sector: "Agriculture", city: "Bafoussam", region: "Ouest", employees: 95, website: "", description: "Élevage avicole et porcin bio" },
  { name: "Société Camerounaise de Conditionnement (SOCAC)", sector: "Agroalimentaire", city: "Douala", region: "Littoral", employees: 140, website: "", description: "Emballage alimentaire et agro-industrie" },
  { name: "Agro-industrie du Cameroun (AGRICAM)", sector: "Agriculture", city: "Bertoua", region: "Est", employees: 220, website: "", description: "Culture du manioc et transformation en farine" },
  { name: "Société d'Investissement Agricole du Cameroun (SIAC)", sector: "Agriculture", city: "Maroua", region: "Extrême-Nord", employees: 160, website: "", description: "Irrigation et cultures maraîchères" },
  { name: "Ferme de la Vallée du Noun", sector: "Agriculture", city: "Foumban", region: "Ouest", employees: 85, website: "", description: "Riziculture et pisciculture" },
  { name: "Coopérative Agricole des Femmes de Bafou (CAFEB)", sector: "Agriculture", city: "Bafoussam", region: "Ouest", employees: 2000, website: "", description: "Coopérative féminine de café et macabo" },
  { name: "Société de Production de Riz du Cameroun (SPRDC)", sector: "Agriculture", city: "Yagoua", region: "Extrême-Nord", employees: 450, website: "", description: "Riziculture irriguée dans la Logone" },
  { name: "Ferme Agricole de Mfou (FAM)", sector: "Agriculture", city: "Mfou", region: "Centre", employees: 130, website: "", description: "Culture de légumes et fruits pour Yaoundé" },

  // ==================== TECHNOLOGIE & TELECOMS (25) ====================
  { name: "MTN Cameroun", sector: "Télécommunications", city: "Douala", region: "Littoral", employees: 850, website: "www.mtn.cm", description: "Leader des télécoms, 4G et mobile money" },
  { name: "Orange Cameroun", sector: "Télécommunications", city: "Douala", region: "Littoral", employees: 720, website: "www.orange.cm", description: "Opérateur télécom et services digitaux" },
  { name: "Camtel", sector: "Télécommunications", city: "Yaoundé", region: "Centre", employees: 1200, website: "www.camtel.cm", description: "Opérateur public, fibre optique et fixe" },
  { name: "Nexttel (Viettel Cameroun)", sector: "Télécommunications", city: "Yaoundé", region: "Centre", employees: 600, website: "www.nexttel.com.cm", description: "3ème opérateur mobile, 4G+" },
  { name: "Ringo (YooMee)", sector: "Télécommunications", city: "Douala", region: "Littoral", employees: 150, website: "www.yoomee.com", description: "Opérateur 4G fixe et mobile" },
  { name: "ActivSpaces", sector: "Technologie", city: "Douala", region: "Littoral", employees: 25, website: "www.activspaces.com", description: "Premier incubateur tech du Cameroun" },
  { name: "Jumia Cameroun", sector: "E-commerce", city: "Douala", region: "Littoral", employees: 180, website: "www.jumia.cm", description: "Marketplace leader en Afrique centrale" },
  { name: "Kiro'o Games", sector: "Technologie", city: "Yaoundé", region: "Centre", employees: 35, website: "www.kiroogames.com", description: "Studio de jeux vidéo africain (Aurion)" },
  { name: "Maviance PLC", sector: "Fintech", city: "Douala", region: "Littoral", employees: 80, website: "www.maviance.com", description: "Solutions de paiement mobile et API" },
  { name: "Momo Paiement (MTN)", sector: "Fintech", city: "Douala", region: "Littoral", employees: 120, website: "www.momo.mtn.cm", description: "Mobile money et services financiers" },
  { name: "Orange Money Cameroun", sector: "Fintech", city: "Douala", region: "Littoral", employees: 95, website: "www.orangemoney.cm", description: "Transfert d'argent et paiements digitaux" },
  { name: "Njorku", sector: "Technologie", city: "Buea", region: "Sud-Ouest", employees: 20, website: "www.njorku.com", description: "Plateforme de recherche d'emploi" },
  { name: "Go-Groups", sector: "Technologie", city: "Douala", region: "Littoral", employees: 45, website: "www.gogroups.com", description: "Développement web et mobile" },
  { name: "Skylabs", sector: "Technologie", city: "Yaoundé", region: "Centre", employees: 30, website: "www.skylabs.cm", description: "Intelligence artificielle et data science" },
  { name: "Buea Tech Hub", sector: "Technologie", city: "Buea", region: "Sud-Ouest", employees: 15, website: "www.bueatechhub.com", description: "Communauté tech et coworking" },
  { name: "SovTech", sector: "Technologie", city: "Douala", region: "Littoral", employees: 50, website: "www.sovtech.com", description: "Développement de logiciels sur mesure" },
  { name: "Afrovision Group", sector: "Technologie", city: "Yaoundé", region: "Centre", employees: 40, website: "www.afrovisiongroup.com", description: "Solutions IT et cybersécurité" },
  { name: "Cameroon Web Solutions", sector: "Technologie", city: "Douala", region: "Littoral", employees: 25, website: "www.cameroonwebsolutions.com", description: "Hébergement web et cloud" },
  { name: "Mboa Digital", sector: "Technologie", city: "Yaoundé", region: "Centre", employees: 18, website: "www.mboa-digital.com", description: "Marketing digital et SEO" },
  { name: "Sagicam", sector: "Technologie", city: "Buea", region: "Sud-Ouest", employees: 22, website: "www.sagicam.com", description: "Développement d'applications web" },
  { name: "Wouaf", sector: "E-commerce", city: "Douala", region: "Littoral", employees: 12, website: "www.wouaf.com", description: "Livraison de repas à domicile" },
  { name: "Gozem Cameroun", sector: "E-commerce", city: "Douala", region: "Littoral", employees: 35, website: "www.gozem.com", description: "Application de VTC et livraison" },
  { name: "Heetch Cameroun", sector: "E-commerce", city: "Douala", region: "Littoral", employees: 28, website: "www.heetch.com", description: "VTC et mobilité urbaine" },
  { name: "Mboa Hub", sector: "Technologie", city: "Yaoundé", region: "Centre", employees: 20, website: "www.mboahub.com", description: "Coworking et innovation sociale" },
  { name: "Silicon Mountain", sector: "Technologie", city: "Buea", region: "Sud-Ouest", employees: 200, website: "www.siliconmountain.co", description: "Écosystème tech de la région Sud-Ouest" },

  // ==================== ENERGIE & MINES (20) ====================
  { name: "SNH (Société Nationale des Hydrocarbures)", sector: "Énergie", city: "Yaoundé", region: "Centre", employees: 1500, website: "www.snh.cm", description: "Gestion des ressources pétrolières et gazières" },
  { name: "ENEO (Energy of Cameroon)", sector: "Énergie", city: "Douala", region: "Littoral", employees: 3200, website: "www.eneo.cm", description: "Distribution d'électricité, filiale d'Actis" },
  { name: "AES-Sonel (historique)", sector: "Énergie", city: "Douala", region: "Littoral", employees: 0, website: "", description: "Prédécesseur d'ENEO dans l'électricité" },
  { name: "Kribi Power Development Company (KPDC)", sector: "Énergie", city: "Kribi", region: "Sud", employees: 180, website: "www.kpdcpower.com", description: "Centrale thermique à gaz de 216 MW" },
  { name: "Dibamba Power Development Company (DPDC)", sector: "Énergie", city: "Douala", region: "Littoral", employees: 120, website: "www.dibambapower.com", description: "Centrale thermique de 86 MW" },
  { name: "Lom Pangar Hydropower Project", sector: "Énergie", city: "Lom Pangar", region: "Est", employees: 300, website: "www.lompangar.com", description: "Barrage hydroélectrique de 30 MW" },
  { name: "Nachtigal Hydropower Company (NHPC)", sector: "Énergie", city: "Nachtigal", region: "Centre", employees: 450, website: "www.nachtigal-hydro.com", description: "Centrale hydroélectrique de 420 MW" },
  { name: "Rio Tinto Alcan (Alucam)", sector: "Mines", city: "Edéa", region: "Littoral", employees: 900, website: "www.alucam-cameroun.com", description: "Première fonderie d'aluminium d'Afrique centrale" },
  { name: "Aluminium du Cameroun (ALUCAM)", sector: "Mines", city: "Edéa", region: "Littoral", employees: 850, website: "www.alucam.com", description: "Production de lingots d'aluminium" },
  { name: "Cimencam (LafargeHolcim)", sector: "Mines", city: "Douala", region: "Littoral", employees: 1100, website: "www.cimencam.com", description: "Leader du ciment au Cameroun" },
  { name: "Dangote Cement Cameroun", sector: "Mines", city: "Douala", region: "Littoral", employees: 650, website: "www.dangote.com", description: "Usine de ciment de 1,5M tonnes/an" },
  { name: "Diamond Cement Cameroun", sector: "Mines", city: "Bouala", region: "Littoral", employees: 380, website: "www.diamondcement.com", description: "Cimenterie dans la région du Littoral" },
  { name: "Cimaf Cameroun", sector: "Mines", city: "Douala", region: "Littoral", employees: 290, website: "www.cimaf.com", description: "Ciment et matériaux de construction" },
  { name: "Geovic Cameroun", sector: "Mines", city: "Yaoundé", region: "Centre", employees: 200, website: "www.geovic.com", description: "Exploration de cobalt et nickel" },
  { name: "Sundance Resources (Mbalam-Nabeba)", sector: "Mines", city: "Yaoundé", region: "Centre", employees: 150, website: "www.sundanceresources.com", description: "Projet de fer de Mbalam-Nabeba" },
  { name: "Cam Iron (Rio Tinto)", sector: "Mines", city: "Yaoundé", region: "Centre", employees: 80, website: "www.camiron.com", description: "Projet d'exportation de minerai de fer" },
  { name: "Perenco Cameroun", sector: "Énergie", city: "Douala", region: "Littoral", employees: 400, website: "www.perenco.com", description: "Exploitation pétrolière offshore" },
  { name: "Addax Petroleum Cameroun", sector: "Énergie", city: "Douala", region: "Littoral", employees: 250, website: "www.addaxpetroleum.com", description: "Production pétrolière et gazière" },
  { name: "Bowleven Cameroon", sector: "Énergie", city: "Douala", region: "Littoral", employees: 120, website: "www.bowleven.com", description: "Exploration gazière offshore" },
  { name: "Victoria Oil & Gas (Logbaba)", sector: "Énergie", city: "Douala", region: "Littoral", employees: 95, website: "www.victoriaoilandgas.com", description: "Projet gazier de Logbaba" },

  // ==================== BANQUES & FINANCE (20) ====================
  { name: "Afriland First Bank", sector: "Banque", city: "Douala", region: "Littoral", employees: 1800, website: "www.afrilandfirstbank.com", description: "Première banque camerounaise indépendante" },
  { name: "Ecobank Cameroun", sector: "Banque", city: "Douala", region: "Littoral", employees: 950, website: "www.ecobank.com", description: "Présence panafricaine, services bancaires" },
  { name: "Société Générale Cameroun", sector: "Banque", city: "Douala", region: "Littoral", employees: 720, website: "www.societegenerale.cm", description: "Banque internationale, crédit et épargne" },
  { name: "Standard Chartered Bank Cameroun", sector: "Banque", city: "Douala", region: "Littoral", employees: 380, website: "www.sc.com/cm", description: "Services bancaires corporate" },
  { name: "UBA Cameroun", sector: "Banque", city: "Douala", region: "Littoral", employees: 650, website: "www.ubacameroon.com", description: "United Bank for Africa, services diversifiés" },
  { name: "BGFI Bank Cameroun", sector: "Banque", city: "Douala", region: "Littoral", employees: 520, website: "www.bgfi.com", description: "Groupe bancaire gabonais en expansion" },
  { name: "Credit Communautaire d'Afrique (CCA Bank)", sector: "Banque", city: "Douala", region: "Littoral", employees: 280, website: "www.ccabank.com", description: "Microfinance et banque communautaire" },
  { name: "Commercial Bank Cameroun (CBC)", sector: "Banque", city: "Douala", region: "Littoral", employees: 450, website: "www.cbc-bank.com", description: "Banque commerciale historique" },
  { name: "National Financial Credit (NFC Bank)", sector: "Banque", city: "Yaoundé", region: "Centre", employees: 320, website: "www.nfcbank.com", description: "Crédit-bail et financement immobilier" },
  { name: "Union Bank of Cameroon (UBC)", sector: "Banque", city: "Douala", region: "Littoral", employees: 180, website: "www.ubc-cameroon.com", description: "Banque régionale spécialisée" },
  { name: "Microfinance Cofina Cameroun", sector: "Microfinance", city: "Douala", region: "Littoral", employees: 250, website: "www.cofina.com", description: "Crédit aux PME et particuliers" },
  { name: "Advans Cameroun", sector: "Microfinance", city: "Douala", region: "Littoral", employees: 180, website: "www.advans-cameroun.com", description: "Microfinance internationale" },
  { name: "Express Union", sector: "Transfert d'argent", city: "Douala", region: "Littoral", employees: 400, website: "www.expressunion.com", description: "Transfert d'argent et services financiers" },
  { name: "Express Exchange", sector: "Transfert d'argent", city: "Douala", region: "Littoral", employees: 220, website: "www.express-exchange.com", description: "Bureaux de change et transferts" },
  { name: "Société Générale de Banque au Cameroun (SGBC)", sector: "Banque", city: "Douala", region: "Littoral", employees: 600, website: "www.sgbc.com", description: "Banque de détail et corporate" },
  { name: "Banque Atlantique Cameroun", sector: "Banque", city: "Douala", region: "Littoral", employees: 350, website: "www.banque-atlantique.com", description: "Groupe bancaire ouest-africain" },
  { name: "Optima Bank Cameroun", sector: "Banque", city: "Douala", region: "Littoral", employees: 150, website: "www.optimabank.com", description: "Banque digitale et innovation" },
  { name: "Cameroon Postal Services (CAMPOST)", sector: "Finance", city: "Yaoundé", region: "Centre", employees: 1200, website: "www.campost.com", description: "Services postaux et financiers" },
  { name: "BEAC (Banque des États de l'Afrique Centrale)", sector: "Finance", city: "Yaoundé", region: "Centre", employees: 800, website: "www.beac.int", description: "Banque centrale de la CEMAC" },
  { name: "COSUMAF (Commission de Surveillance du Marché Financier)", sector: "Finance", city: "Yaoundé", region: "Centre", employees: 60, website: "www.cosumaf.org", description: "Régulation du marché financier de la CEMAC" },

  // ==================== TRANSPORT & LOGISTIQUE (15) ====================
  { name: "Camair-Co", sector: "Transport", city: "Douala", region: "Littoral", employees: 650, website: "www.camair-co.cm", description: "Compagnie aérienne nationale du Cameroun" },
  { name: "Camrail (Bolloré Railways)", sector: "Transport", city: "Douala", region: "Littoral", employees: 1800, website: "www.camrail.net", description: "Exploitation du réseau ferré camerounais" },
  { name: "Société Nationale des Transports (SNT)", sector: "Transport", city: "Yaoundé", region: "Centre", employees: 2200, website: "www.snt-cm.com", description: "Transport urbain et interurbain" },
  { name: "Bolloré Transport & Logistics Cameroun", sector: "Logistique", city: "Douala", region: "Littoral", employees: 950, website: "www.bollore-logistics.com", description: "Logistique portuaire et transport" },
  { name: "Maersk Cameroun", sector: "Logistique", city: "Douala", region: "Littoral", employees: 180, website: "www.maersk.com", description: "Transport maritime et logistique" },
  { name: "CMA CGM Cameroun", sector: "Logistique", city: "Douala", region: "Littoral", employees: 150, website: "www.cma-cgm.com", description: "Armement maritime et conteneurs" },
  { name: "DHL Cameroun", sector: "Logistique", city: "Douala", region: "Littoral", employees: 280, website: "www.dhl.com", description: "Logistique express internationale" },
  { name: "Agility Cameroun", sector: "Logistique", city: "Douala", region: "Littoral", employees: 120, website: "www.agility.com", description: "Supply chain et entrepôts" },
  { name: "Société de Patrimoine des Ports du Cameroun (SPPC)", sector: "Transport", city: "Douala", region: "Littoral", employees: 800, website: "www.sppc-cm.com", description: "Gestion des ports de Douala et Kribi" },
  { name: "Kribi Port Authority", sector: "Transport", city: "Kribi", region: "Sud", employees: 350, website: "www.kribi-port.com", description: "Port en eau profonde du Cameroun" },
  { name: "Douala International Airport (DLA)", sector: "Transport", city: "Douala", region: "Littoral", employees: 450, website: "www.aeroport-douala.com", description: "Aéroport international principal" },
  { name: "Yaoundé Nsimalen International Airport", sector: "Transport", city: "Yaoundé", region: "Centre", employees: 380, website: "www.aeroport-yaounde.com", description: "Deuxième aéroport international" },
  { name: "Transport Express Cameroun", sector: "Transport", city: "Douala", region: "Littoral", employees: 200, website: "", description: "Transport routier de marchandises" },
  { name: "Société Camerounaise de Transport Aérien (SCATA)", sector: "Transport", city: "Douala", region: "Littoral", employees: 85, website: "", description: "Transport aérien charter" },
  { name: "MiiZ Cameroun", sector: "Logistique", city: "Yaoundé", region: "Centre", employees: 15, website: "www.miiz.cm", description: "Courtage-affrètement et logistique" },

  // ==================== CONSTRUCTION & IMMOBILIER (15) ====================
  { name: "Société Immobilière du Cameroun (SIC)", sector: "Immobilier", city: "Douala", region: "Littoral", employees: 450, website: "www.sic-cameroun.com", description: "Premier promoteur immobilier du pays" },
  { name: "Maetur (Magasins Généraux du Cameroun)", sector: "Immobilier", city: "Douala", region: "Littoral", employees: 320, website: "www.maetur.com", description: "Entreposage et logistique immobilière" },
  { name: "SOCAR (Société Camerounaise de Résidences)", sector: "Immobilier", city: "Yaoundé", region: "Centre", employees: 180, website: "www.socar.com", description: "Construction de résidences de standing" },
  { name: "Groupement du Bâtiment et des Travaux Publics (GBTP)", sector: "Construction", city: "Yaoundé", region: "Centre", employees: 250, website: "www.gbtp.com", description: "BTP et génie civil" },
  { name: "Ets J.B. Fouda & Fils", sector: "Construction", city: "Yaoundé", region: "Centre", employees: 120, website: "", description: "Construction et travaux publics" },
  { name: "Société de Construction et de Gestion Immobilière (SCGI)", sector: "Immobilier", city: "Douala", region: "Littoral", employees: 95, website: "", description: "Promotion immobilière et gestion" },
  { name: "Habitat Cameroun", sector: "Immobilier", city: "Yaoundé", region: "Centre", employees: 70, website: "www.habitat-cameroun.com", description: "Logement social et construction" },
  { name: "Cimenteries du Cameroun (CIMENCAM)", sector: "Construction", city: "Douala", region: "Littoral", employees: 1100, website: "www.cimencam.com", description: "Matériaux de construction et ciment" },
  { name: "Société des Ciments de l'Ouest (SCIO)", sector: "Construction", city: "Bafoussam", region: "Ouest", employees: 200, website: "", description: "Cimenterie régionale" },
  { name: "Société de Construction Métallique du Cameroun (SCMC)", sector: "Construction", city: "Douala", region: "Littoral", employees: 150, website: "", description: "Charpente métallique et bâtiments industriels" },
  { name: "Ets Magil Construction", sector: "Construction", city: "Douala", region: "Littoral", employees: 80, website: "", description: "Construction et rénovation" },
  { name: "Société d'Aménagement et d'Equipement des Terrains (SAET)", sector: "Immobilier", city: "Yaoundé", region: "Centre", employees: 60, website: "", description: "Aménagement foncier et lotissement" },
  { name: "Groupement des Promoteurs Immobiliers du Cameroun (GPIC)", sector: "Immobilier", city: "Douala", region: "Littoral", employees: 45, website: "", description: "Fédération des promoteurs immobiliers" },
  { name: "Société de Construction du Cameroun (SCC)", sector: "Construction", city: "Yaoundé", region: "Centre", employees: 110, website: "", description: "Bâtiment et travaux publics" },
  { name: "Ets TAMAZERT", sector: "Construction", city: "Douala", region: "Littoral", employees: 65, website: "", description: "Construction et génie civil" },

  // ==================== SANTE & PHARMACIE (10) ====================
  { name: "Centre Pasteur du Cameroun", sector: "Santé", city: "Yaoundé", region: "Centre", employees: 350, website: "www.pasteur-cameroun.org", description: "Recherche médicale et vaccinations" },
  { name: "Hôpital Général de Douala (HGD)", sector: "Santé", city: "Douala", region: "Littoral", employees: 800, website: "www.hgd-douala.com", description: "Principal hôpital de référence du Littoral" },
  { name: "Hôpital Central de Yaoundé (HCY)", sector: "Santé", city: "Yaoundé", region: "Centre", employees: 1200, website: "www.hcy-cm.com", description: "Hôpital universitaire et de référence" },
  { name: "Clinique de l'Aéroport", sector: "Santé", city: "Douala", region: "Littoral", employees: 120, website: "www.clinique-aeroport.com", description: "Clinique privée de référence" },
  { name: "Pharmacie Centrale du Cameroun (PHARMACAM)", sector: "Pharmacie", city: "Yaoundé", region: "Centre", employees: 200, website: "www.pharmacam.com", description: "Distribution pharmaceutique nationale" },
  { name: "Société des Industries Pharmaceutiques du Cameroun (SIPHARM)", sector: "Pharmacie", city: "Douala", region: "Littoral", employees: 150, website: "www.sipharm.com", description: "Production de médicaments génériques" },
  { name: "Dafra Pharma Cameroun", sector: "Pharmacie", city: "Douala", region: "Littoral", employees: 80, website: "www.dafrapharma.com", description: "Laboratoire pharmaceutique" },
  { name: "Pharmacie du Littoral", sector: "Pharmacie", city: "Douala", region: "Littoral", employees: 60, website: "", description: "Réseau de pharmacies" },
  { name: "Clinique Bastos", sector: "Santé", city: "Yaoundé", region: "Centre", employees: 95, website: "www.clinique-bastos.com", description: "Médecine spécialisée et chirurgie" },
  { name: "Hôpital Laquintinie", sector: "Santé", city: "Douala", region: "Littoral", employees: 600, website: "www.hopital-laquintinie.com", description: "Hôpital de référence du Littoral" },

  // ==================== EDUCATION & FORMATION (10) ====================
  { name: "Université de Yaoundé I", sector: "Éducation", city: "Yaoundé", region: "Centre", employees: 2500, website: "www.uy1.uninet.cm", description: "Première université du Cameroun" },
  { name: "Université de Douala", sector: "Éducation", city: "Douala", region: "Littoral", employees: 1800, website: "www.univ-douala.com", description: "Université de la capitale économique" },
  { name: "Université de Dschang", sector: "Éducation", city: "Dschang", region: "Ouest", employees: 1200, website: "www.univ-dschang.org", description: "Agronomie et sciences de la nature" },
  { name: "Institut Supérieur de Technologie du Cameroun (ISTC)", sector: "Éducation", city: "Yaoundé", region: "Centre", employees: 150, website: "www.istc-cm.com", description: "École d'ingénieurs et technologie" },
  { name: "C'FAIH (Centre de Formation et d'Accompagnement à l'Insertion et à l'Humanitaire)", sector: "Formation", city: "Yvelines", region: "France", employees: 25, website: "www.cfaih.com", description: "Formation professionnelle et insertion" },
  { name: "Institut Supérieur des Sciences et Techniques (ISST)", sector: "Éducation", city: "Douala", region: "Littoral", employees: 80, website: "www.isst-douala.com", description: "Formation supérieure technique" },
  { name: "École Nationale Supérieure Polytechnique de Yaoundé", sector: "Éducation", city: "Yaoundé", region: "Centre", employees: 400, website: "www.polytechnique.cm", description: "Grande école d'ingénieurs" },
  { name: "Institut Africain d'Informatique (IAI-Cameroun)", sector: "Éducation", city: "Yaoundé", region: "Centre", employees: 90, website: "www.iai-cameroun.com", description: "Formation en informatique" },
  { name: "École Supérieure des Sciences Économiques et Commerciales (ESSEC)", sector: "Éducation", city: "Douala", region: "Littoral", employees: 110, website: "www.essec-douala.com", description: "École de commerce et management" },
  { name: "Institut Supérieur de Management (ISM)", sector: "Éducation", city: "Douala", region: "Littoral", employees: 70, website: "www.ism-douala.com", description: "Management et entrepreneuriat" },

  // ==================== COMMERCE & DISTRIBUTION (10) ====================
  { name: "Super U Cameroun (Hypermarché)", sector: "Commerce", city: "Douala", region: "Littoral", employees: 450, website: "www.superu.cm", description: "Grande distribution alimentaire" },
  { name: "Carrefour Cameroun", sector: "Commerce", city: "Douala", region: "Littoral", employees: 380, website: "www.carrefour.com", description: "Hypermarché international" },
  { name: "Maison du Paysan", sector: "Commerce", city: "Yaoundé", region: "Centre", employees: 120, website: "www.maisondupaysan.com", description: "Distribution de produits agricoles" },
  { name: "Société Commerciale du Cameroun (SCC)", sector: "Commerce", city: "Douala", region: "Littoral", employees: 600, website: "", description: "Distribution générale et import-export" },
  { name: "Ets Chanimba", sector: "Commerce", city: "Douala", region: "Littoral", employees: 200, website: "", description: "Importation et distribution de biens" },
  { name: "Société de Distribution de Matériel Électrique (SDME)", sector: "Commerce", city: "Douala", region: "Littoral", employees: 85, website: "", description: "Distribution de matériel électrique" },
  { name: "Société Camerounaise de Distribution (SCD)", sector: "Commerce", city: "Douala", region: "Littoral", employees: 150, website: "", description: "Distribution de produits de consommation" },
  { name: "Ets M. Nana & Fils", sector: "Commerce", city: "Douala", region: "Littoral", employees: 95, website: "", description: "Commerce général et importation" },
  { name: "Société de Commerce et d'Importation du Cameroun (SCIC)", sector: "Commerce", city: "Yaoundé", region: "Centre", employees: 70, website: "", description: "Import-export et négoce" },
  { name: "Groupement des Commerçants du Cameroun (GCC)", sector: "Commerce", city: "Douala", region: "Littoral", employees: 50, website: "", description: "Fédération du commerce" },

  // ==================== TOURISME & HOTELLERIE (10) ====================
  { name: "Hôtel Hilton Yaoundé", sector: "Hôtellerie", city: "Yaoundé", region: "Centre", employees: 280, website: "www.hilton.com", description: "Hôtel 5 étoiles international" },
  { name: "Hôtel La Falaise (Groupe Vetoquinol)", sector: "Hôtellerie", city: "Douala", region: "Littoral", employees: 150, website: "www.lafalaise.com", description: "Hôtel de luxe et conférences" },
  { name: "Hôtel Sawa (Groupe Accor)", sector: "Hôtellerie", city: "Douala", region: "Littoral", employees: 200, website: "www.accor.com", description: "Hôtel 4 étoiles en bord de mer" },
  { name: "Hôtel Mont Fébé", sector: "Hôtellerie", city: "Yaoundé", region: "Centre", employees: 120, website: "www.montfebe.com", description: "Hôtel de luxe avec vue panoramique" },
  { name: "Société de Gestion Hôtelière du Cameroun (SGHC)", sector: "Hôtellerie", city: "Douala", region: "Littoral", employees: 80, website: "", description: "Gestion d'hôtels et resorts" },
  { name: "Tourisme Cameroun (OTC)", sector: "Tourisme", city: "Yaoundé", region: "Centre", employees: 150, website: "www.tourismecameroun.com", description: "Office national du tourisme" },
  { name: "Sanaga Beach Hotel", sector: "Hôtellerie", city: "Edéa", region: "Littoral", employees: 60, website: "www.sanagabeach.com", description: "Resort en bord de rivière" },
  { name: "Hôtel Djeuga Palace", sector: "Hôtellerie", city: "Yaoundé", region: "Centre", employees: 90, website: "www.djeugapalace.com", description: "Hôtel de conférences et séminaires" },
  { name: "Hôtel Résidence La Falaise", sector: "Hôtellerie", city: "Yaoundé", region: "Centre", employees: 70, website: "", description: "Résidence hôtelière de standing" },
  { name: "Société des Grands Hôtels du Cameroun (SGHC)", sector: "Hôtellerie", city: "Douala", region: "Littoral", employees: 110, website: "", description: "Groupe hôtelier historique" },

  // ==================== MEDIA & COMMUNICATION (5) ====================
  { name: "CRT (Cameroon Radio Television)", sector: "Média", city: "Yaoundé", region: "Centre", employees: 1500, website: "www.crtv.cm", description: "Radio-télévision publique nationale" },
  { name: "Canal 2 International", sector: "Média", city: "Douala", region: "Littoral", employees: 200, website: "www.canal2international.com", description: "Première chaîne TV privée" },
  { name: "Equinoxe TV", sector: "Média", city: "Douala", region: "Littoral", employees: 120, website: "www.equinoxetv.com", description: "Télévision d'information" },
  { name: "Le Jour", sector: "Média", city: "Yaoundé", region: "Centre", employees: 80, website: "www.lejour.com", description: "Quotidien d'information générale" },
  { name: "Mutations", sector: "Média", city: "Yaoundé", region: "Centre", employees: 60, website: "www.mutations.com", description: "Hebdomadaire d'investigation" },
];

async function main() {
  console.log("🌱 Démarrage du seeding des entreprises...");
  console.log(`📊 Nombre d'entreprises à créer : ${enterprises.length}`);

  let created = 0;
  let updated = 0;
  let errors = 0;

  for (const enterprise of enterprises) {
    try {
      const result = await prisma.enterprise.upsert({
        where: { name: enterprise.name },
        update: {
          ...enterprise,
          updatedAt: new Date(),
        },
        create: {
          ...enterprise,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      if (result.createdAt.getTime() === result.updatedAt.getTime()) {
        created++;
        console.log(`  ✅ Créée : ${enterprise.name}`);
      } else {
        updated++;
        console.log(`  🔄 Mise à jour : ${enterprise.name}`);
      }
    } catch (error) {
      errors++;
      console.error(`  ❌ Erreur : ${enterprise.name} - ${error.message}`);
    }
  }

  console.log("\n📊 RÉSULTAT DU SEEDING :");
  console.log(`   ✅ Créées : ${created}`);
  console.log(`   🔄 Mises à jour : ${updated}`);
  console.log(`   ❌ Erreurs : ${errors}`);
  console.log(`   📈 Total traité : ${created + updated + errors}`);
  console.log("\n🎉 Seeding terminé !");
}

main()
  .catch((e) => {
    console.error("❌ Erreur fatale :", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
