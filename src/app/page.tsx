import Header from "./components/Header";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center text-center p-10">
        <h1 className="text-4xl font-bold">Welcome to the Lotto DApp ??</h1>
        <p className="text-lg mt-4">Join the lottery and win big! Draws happen twice a week.</p>
        <a href="/buy-tickets" className="mt-6 bg-blue-600 text-white px-6 py-3 rounded">
          Buy Tickets
        </a>
      </main>
      <Footer />
    </div>
  );
}
