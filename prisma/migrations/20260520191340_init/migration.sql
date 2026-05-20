-- CreateEnum
CREATE TYPE "Genero" AS ENUM ('HOMBRE', 'MUJER');

-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('ESTUDIANTE', 'DOCENTE', 'ADMIN');

-- CreateEnum
CREATE TYPE "Dificultad" AS ENUM ('FACIL', 'MEDIO', 'DIFICIL');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "genero" "Genero" NOT NULL,
    "rol" "Rol" NOT NULL DEFAULT 'ESTUDIANTE',
    "xpTotal" INTEGER NOT NULL DEFAULT 0,
    "monedas" INTEGER NOT NULL DEFAULT 0,
    "gemas" INTEGER NOT NULL DEFAULT 0,
    "etapaActual" INTEGER NOT NULL DEFAULT 0,
    "rachaActual" INTEGER NOT NULL DEFAULT 0,
    "rachaMaxima" INTEGER NOT NULL DEFAULT 0,
    "precision" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ultimoLogin" TIMESTAMP(3),

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cursos" (
    "id" SERIAL NOT NULL,
    "numero" INTEGER NOT NULL,
    "ciclo" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "sumilla" TEXT NOT NULL,
    "esElectivo" BOOLEAN NOT NULL DEFAULT false,
    "etapaMinima" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "cursos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "preguntas" (
    "id" TEXT NOT NULL,
    "cursoId" INTEGER NOT NULL,
    "enunciado" TEXT NOT NULL,
    "alternativas" JSONB NOT NULL,
    "correctaIdx" INTEGER NOT NULL,
    "explicacion" TEXT,
    "dificultad" "Dificultad" NOT NULL DEFAULT 'MEDIO',
    "etapa" INTEGER NOT NULL,
    "conceptosClave" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "generadaPorIA" BOOLEAN NOT NULL DEFAULT true,
    "modeloIA" TEXT,
    "vecesUsada" INTEGER NOT NULL DEFAULT 0,
    "porcentajeAcierto" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "creadaEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "preguntas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "etapas" (
    "id" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "porcentajeMin" DOUBLE PRECISION NOT NULL,
    "xpRequerido" INTEGER NOT NULL,
    "imagenHombre" TEXT NOT NULL,
    "imagenMujer" TEXT NOT NULL,
    "recompensaMonedas" INTEGER NOT NULL DEFAULT 0,
    "recompensaGemas" INTEGER NOT NULL DEFAULT 0,
    "medalla" TEXT,

    CONSTRAINT "etapas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partidas" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "cursoId" INTEGER,
    "etapa" INTEGER NOT NULL,
    "iniciadaEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finalizadaEn" TIMESTAMP(3),
    "totalPreguntas" INTEGER NOT NULL DEFAULT 0,
    "totalCorrectas" INTEGER NOT NULL DEFAULT 0,
    "puntajeFinal" INTEGER NOT NULL DEFAULT 0,
    "tiempoTotalSeg" INTEGER NOT NULL DEFAULT 0,
    "rachaMaxPartida" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "partidas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "respuestas" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "preguntaId" TEXT NOT NULL,
    "partidaId" TEXT,
    "alternativaSeleccionada" INTEGER NOT NULL,
    "esCorrecta" BOOLEAN NOT NULL,
    "tiempoSeg" INTEGER NOT NULL,
    "speedBonus" BOOLEAN NOT NULL DEFAULT false,
    "xpGanado" INTEGER NOT NULL DEFAULT 0,
    "respondidaEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "respuestas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "progresos" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "cursoId" INTEGER NOT NULL,
    "preguntasResp" INTEGER NOT NULL DEFAULT 0,
    "preguntasCorrectas" INTEGER NOT NULL DEFAULT 0,
    "xpAcumulado" INTEGER NOT NULL DEFAULT 0,
    "porcentaje" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "completado" BOOLEAN NOT NULL DEFAULT false,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "progresos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "logros" (
    "id" SERIAL NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "icono" TEXT NOT NULL,
    "xpRecompensa" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "logros_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios_logros" (
    "usuarioId" TEXT NOT NULL,
    "logroId" INTEGER NOT NULL,
    "desbloqueadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_logros_pkey" PRIMARY KEY ("usuarioId","logroId")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE INDEX "usuarios_xpTotal_idx" ON "usuarios"("xpTotal");

-- CreateIndex
CREATE UNIQUE INDEX "cursos_numero_key" ON "cursos"("numero");

-- CreateIndex
CREATE INDEX "cursos_ciclo_idx" ON "cursos"("ciclo");

-- CreateIndex
CREATE INDEX "cursos_etapaMinima_idx" ON "cursos"("etapaMinima");

-- CreateIndex
CREATE INDEX "preguntas_cursoId_etapa_idx" ON "preguntas"("cursoId", "etapa");

-- CreateIndex
CREATE INDEX "preguntas_etapa_dificultad_idx" ON "preguntas"("etapa", "dificultad");

-- CreateIndex
CREATE INDEX "partidas_usuarioId_finalizadaEn_idx" ON "partidas"("usuarioId", "finalizadaEn");

-- CreateIndex
CREATE INDEX "respuestas_usuarioId_respondidaEn_idx" ON "respuestas"("usuarioId", "respondidaEn");

-- CreateIndex
CREATE INDEX "respuestas_preguntaId_idx" ON "respuestas"("preguntaId");

-- CreateIndex
CREATE INDEX "progresos_usuarioId_idx" ON "progresos"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "progresos_usuarioId_cursoId_key" ON "progresos"("usuarioId", "cursoId");

-- CreateIndex
CREATE UNIQUE INDEX "logros_codigo_key" ON "logros"("codigo");

-- AddForeignKey
ALTER TABLE "preguntas" ADD CONSTRAINT "preguntas_cursoId_fkey" FOREIGN KEY ("cursoId") REFERENCES "cursos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partidas" ADD CONSTRAINT "partidas_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "respuestas" ADD CONSTRAINT "respuestas_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "respuestas" ADD CONSTRAINT "respuestas_preguntaId_fkey" FOREIGN KEY ("preguntaId") REFERENCES "preguntas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "respuestas" ADD CONSTRAINT "respuestas_partidaId_fkey" FOREIGN KEY ("partidaId") REFERENCES "partidas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progresos" ADD CONSTRAINT "progresos_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progresos" ADD CONSTRAINT "progresos_cursoId_fkey" FOREIGN KEY ("cursoId") REFERENCES "cursos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios_logros" ADD CONSTRAINT "usuarios_logros_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios_logros" ADD CONSTRAINT "usuarios_logros_logroId_fkey" FOREIGN KEY ("logroId") REFERENCES "logros"("id") ON DELETE CASCADE ON UPDATE CASCADE;
