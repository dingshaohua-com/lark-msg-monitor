import '@/api/init';
import router from './router'
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router/dom'
import '@/App.css';

const rootEl = document.getElementById('root');
if (rootEl) {
  const root = ReactDOM.createRoot(rootEl);
  root.render(
    <RouterProvider router={router} />
  );
}
