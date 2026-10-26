import type { Metadata } from "next";
import NexusOne from "../../components/universe/NexusOne";
import "./nexus-one.css";

export const metadata: Metadata = {
  title: "Nexus One | Developer Portfolio, AI & Project Universe",
  description: "Explore Nexus AI, original JavaScript projects, documented certifications, professional resume and independent research in one interactive portfolio.",
};

export default function NexusOnePage() {
  return <NexusOne />;
}
