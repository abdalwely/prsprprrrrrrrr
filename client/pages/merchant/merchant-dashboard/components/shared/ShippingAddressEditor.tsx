import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import type { ShippingAddress } from "@/lib/firestore";

interface ShippingAddressEditorProps {
  address: ShippingAddress;
  onSave: (address: ShippingAddress) => void;
  onCancel: () => void;
  saving?: boolean;
  title?: string;
  YEMENI_GOVERNORATES?: string[];
}

export function ShippingAddressEditor({
  address,
  onSave,
  onCancel,
  saving = false,
  title = "تعديل عنوان الشحن",
  YEMENI_GOVERNORATES = [
    "أمانة العاصمة (صنعاء)",
    "صنعاء",
    "عدن",
    "تعز",
    "الحديدة",
    "إب",
    "ذمار",
    "مأرب",
    "الجوف",
    "المهرة",
    "حضرموت",
    "شبوة",
    "عمران",
    "البيضاء",
    "الضالع",
    "لحج",
    "أبين",
    "حجة",
    "صعدة",
    "ريمة",
    "سقطرى",
  ],
}: ShippingAddressEditorProps) {
  const [formData, setFormData] = useState<ShippingAddress>(address);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>المحافظة</Label>
            <Select
              value={formData.governorate}
              onValueChange={(value) =>
                setFormData({ ...formData, governorate: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر المحافظة" />
              </SelectTrigger>
              <SelectContent>
                {YEMENI_GOVERNORATES.map((gov) => (
                  <SelectItem key={gov} value={gov}>
                    {gov}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>المدينة</Label>
            <Input
              value={formData.city}
              onChange={(e) =>
                setFormData({ ...formData, city: e.target.value })
              }
              placeholder="المدينة"
            />
          </div>
          <div className="space-y-2">
            <Label>الشارع</Label>
            <Input
              value={formData.street}
              onChange={(e) =>
                setFormData({ ...formData, street: e.target.value })
              }
              placeholder="اسم الشارع"
            />
          </div>
          <div className="space-y-2">
            <Label>الرمز البريدي</Label>
            <Input
              value={formData.zipCode}
              onChange={(e) =>
                setFormData({ ...formData, zipCode: e.target.value })
              }
              placeholder="الرمز البريدي"
            />
          </div>
          <div className="space-y-2">
            <Label>الدولة</Label>
            <Input
              value={formData.country}
              onChange={(e) =>
                setFormData({ ...formData, country: e.target.value })
              }
              placeholder="الدولة"
              defaultValue="اليمن"
            />
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onCancel}>
            إلغاء
          </Button>
          <Button onClick={() => onSave(formData)} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                جاري الحفظ...
              </>
            ) : (
              "حفظ"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
