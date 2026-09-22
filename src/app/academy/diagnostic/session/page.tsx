import {
  loadPublicDiagnosticQuestions,
} from "@/lib/academy-diagnostic";
import DiagnosticSessionClient from "./DiagnosticSessionClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Diagnostic en cours | PARZI Academy",
  description:
    "Session interactive du diagnostic initial PARZI Academy.",
};

export default function DiagnosticSessionPage() {
  const questions = loadPublicDiagnosticQuestions();

  return (
    <DiagnosticSessionClient questions={questions} />
  );
}
