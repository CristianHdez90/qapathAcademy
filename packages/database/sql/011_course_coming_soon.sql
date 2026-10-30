-- Estado «En construcción»: el curso se ve en el catálogo con el aviso «Muy pronto estará listo…»,
-- pero su contenido aún no se ofrece. Aditiva; no toca progreso, notas ni rutas.
ALTER TABLE courses ADD COLUMN IF NOT EXISTS coming_soon boolean NOT NULL DEFAULT false;
-- Situación inicial: solo «Fundamentos del Testing» tiene el contenido terminado.
UPDATE courses SET coming_soon=true WHERE catalog_managed AND status='PUBLISHED' AND slug<>'fundamentos';
