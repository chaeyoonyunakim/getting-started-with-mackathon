import Header from "@/components/Header";
import ChoiceBoard from "@/components/ChoiceBoard";
import StudentSetupModal from "@/components/StudentSetupModal";
import StudentProfileChip from "@/components/StudentProfileChip";
import { StudentProvider } from "@/contexts/StudentContext";

const Index = () => {
  return (
    <StudentProvider>
      <div className="min-h-screen bg-background">
        <Header profileChip={<StudentProfileChip />} />
        <main className="py-6">
          <ChoiceBoard />
        </main>
        <StudentSetupModal />
      </div>
    </StudentProvider>
  );
};

export default Index;
