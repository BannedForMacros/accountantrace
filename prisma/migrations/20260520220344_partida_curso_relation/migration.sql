-- AddForeignKey
ALTER TABLE "partidas" ADD CONSTRAINT "partidas_cursoId_fkey" FOREIGN KEY ("cursoId") REFERENCES "cursos"("id") ON DELETE SET NULL ON UPDATE CASCADE;
