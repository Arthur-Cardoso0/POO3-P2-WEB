import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import RotaProtegida from './components/RotaProtegida';
import Carrinho from './pages/Carrinho';
import Catalogo from './pages/Catalogo';
import Contato from './pages/Contato';
import Login from './pages/Login';
import PedidoEnviado from './pages/PedidoEnviado';
import ProdutoDetalhe from './pages/ProdutoDetalhe';
import AdminLayout from './pages/admin/AdminLayout';
import AdminMensagens from './pages/admin/AdminMensagens';
import AdminPedidos from './pages/admin/AdminPedidos';
import AdminProdutos from './pages/admin/AdminProdutos';
import AdminRelatorios from './pages/admin/AdminRelatorios';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Catalogo />} />
        <Route path="produtos/:id" element={<ProdutoDetalhe />} />
        <Route path="carrinho" element={<Carrinho />} />
        <Route path="pedido-enviado" element={<PedidoEnviado />} />
        <Route path="contato" element={<Contato />} />
        <Route path="login" element={<Login />} />

        <Route element={<RotaProtegida />}>
          <Route path="admin" element={<AdminLayout />}>
            <Route index element={<AdminPedidos />} />
            <Route path="produtos" element={<AdminProdutos />} />
            <Route path="mensagens" element={<AdminMensagens />} />
            <Route element={<RotaProtegida perfis={['ADMIN']} />}>
              <Route path="relatorios" element={<AdminRelatorios />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<p className="vazio">Página não encontrada.</p>} />
      </Route>
    </Routes>
  );
}
