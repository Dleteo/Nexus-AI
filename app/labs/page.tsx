import type { Metadata } from "next";
import LabsWorkspace from "../../components/labs/LabsWorkspace";
export const metadata: Metadata = { title: "Engineering Labs | Nexus AI", description: "Four interactive, transparent engineering prototypes: commerce, visual editor, service monitoring, and software factory planning." };
export default function LabsPage(){ return <LabsWorkspace />; }
