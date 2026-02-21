import Header from "@/components/Header";
import ChoiceBoard from "@/components/ChoiceBoard";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-6">
        <ChoiceBoard />
      </main>
    </div>
  );
};

export default Index;
