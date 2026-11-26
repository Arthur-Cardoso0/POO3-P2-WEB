interface Props {
  pagina: number;
  totalPaginas: number;
  onChange: (pagina: number) => void;
}

export default function Paginacao({ pagina, totalPaginas, onChange }: Props) {
  if (totalPaginas <= 1) return null;
  return (
    <nav className="paginacao" aria-label="Paginação">
      <button className="btn btn-secundario" disabled={pagina <= 1} onClick={() => onChange(pagina - 1)}>
        ← Anterior
      </button>
      <span>Página {pagina} de {totalPaginas}</span>
      <button className="btn btn-secundario" disabled={pagina >= totalPaginas} onClick={() => onChange(pagina + 1)}>
        Próxima →
      </button>
    </nav>
  );
}
