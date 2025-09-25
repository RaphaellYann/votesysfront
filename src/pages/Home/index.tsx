function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center px-4">
      <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-12 max-w-2xl text-center">
        <h1 className="text-5xl font-extrabold text-gray-800 mb-6">
          👋 Bem-vindo à Home
        </h1>
        <p className="text-lg text-gray-600 mb-8 leading-relaxed">
          Fico feliz em ter você aqui!  
          Explore o site através do menu acima e aproveite a experiência.
        </p>
        <a
          href="/usuario"
          className="inline-block bg-indigo-600 text-white font-medium px-6 py-3 rounded-full shadow-md hover:bg-indigo-700 transition-all"
        >
          Ver Usuários
        </a>
      </div>
    </main>
  );
}

export default Home;