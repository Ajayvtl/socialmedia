"use client";

import { PageContainer } from "@/components/ui/PageContainer";
import { PageHeader } from "@/components/ui/PageHeader";
import FamilyGraphView from "@/components/family-graph/FamilyGraphView";

export default function FamilyGraphPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Family & Network Graph"
        description="Visualize your personal network, uplines, downlines, and family relationships."
        badge="Interactive"
      />
      <div className="mt-6">
        <FamilyGraphView />
      </div>
    </PageContainer>
  );
}