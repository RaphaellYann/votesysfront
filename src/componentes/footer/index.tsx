function Footer() {
  return (
    <footer className="bg-dark text-white text-center py-4 mt-auto">
      <div className="container">
        <p className="mb-0">
          &copy; {new Date().getFullYear()} VoteSys. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}

export default Footer;