export default function Header() {
  return (
    <header className="bg-white shadow-sm py-4">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <h1 className="text-xl font-semibold text-gray-800">
          <span className="text-primary">Sistema</span> de Gestão
        </h1>
        <div className="hidden sm:block">
          <span className="text-sm text-gray-500">Precisa de ajuda?</span>
          <a href="#" className="text-sm text-primary font-medium ml-2">Suporte</a>
        </div>
      </div>
    </header>
  );
}
