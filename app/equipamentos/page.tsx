import { MainLayout } from "@/components/layout/main-layout"
import { EquipmentList } from "@/components/equipment/equipment-list"

export default async function EquipmentPage() {
  return (
    <MainLayout showBackButton={true} title="Equipamentos">
      <div className="space-y-6">
        <EquipmentList />
      </div>
    </MainLayout>
  )
}
