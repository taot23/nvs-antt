export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 py-6">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center sm:flex-row sm:justify-between">
          <p className="text-sm text-gray-500">© 2023 Sistema de Gestão. Todos os direitos reservados.</p>
          <div className="mt-3 sm:mt-0">
            <ul className="flex space-x-4">
              <li><a href="#" className="text-sm text-gray-500 hover:text-gray-700">Privacidade</a></li>
              <li><a href="#" className="text-sm text-gray-500 hover:text-gray-700">Termos</a></li>
              <li><a href="#" className="text-sm text-gray-500 hover:text-gray-700">Contato</a></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
