import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Edit, Trash2, MapPin, Check, Home, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import axiosClient from '@/axiosClient';
import { toast } from 'sonner';
import { addressSchema, AddressFormData } from "@/schemas/addressesSchema";
import { useNavigate } from 'react-router-dom';



interface Address extends AddressFormData {
  id: number;
}

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    watch
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      label: '',
      recipientName: '',
      phone: '',
      streetAddress: '',
      addressLine2: '',
      suburb: '',
      city: '',
      province: '',
      postalCode: '',
      country: 'South Africa',
      isDefault: false,
      type: 'both'
    }
  });

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const { data } = await axiosClient.get('/addresses');
      setAddresses(data.addresses || []);
    } catch (error) {
      toast.error('Failed to load addresses');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    reset({
      label: '',
      recipientName: '',
      phone: '',
      streetAddress: '',
      addressLine2: '',
      suburb: '',
      city: '',
      province: '',
      postalCode: '',
      country: 'South Africa',
      isDefault: false,
      type: 'both'
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (address: Address) => {
    reset({
      label: address.label,
      recipientName: address.recipientName,
      phone: address.phone,
      streetAddress: address.streetAddress,
      addressLine2: address.addressLine2 || '',
      suburb: address.suburb || '',
      city: address.city,
      province: address.province,
      postalCode: address.postalCode,
      country: address.country,
      isDefault: address.isDefault,
      type: address.type
    });
    setEditingId(address.id);
    setShowForm(true);
  };
const onSubmit = async (data: AddressFormData) => {
  setSubmitting(true);

  try {
    if (editingId) {
      await axiosClient.put(`/addresses/${editingId}`, data);
      toast.success("Address updated successfully");
      
      fetchAddresses();
      resetForm();
    } else {
      await axiosClient.post("/addresses", data);
      
      toast.success("Address added successfully! Redirecting to checkout...");
        navigate("/checkout");
     
    }

  } catch (error: any) {
    toast.error(
      error.response?.data?.message || "Failed to save address"
    );
  } finally {
    setSubmitting(false);
  }
};

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this address?')) return;

    try {
      await axiosClient.delete(`/addresses/${id}`);
      toast.success('Address deleted successfully');
      fetchAddresses();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete address');
    }
  };

  const handleSetDefault = async (id: number) => {
    try {
      await axiosClient.put(`/addresses/${id}/set-default`);
      toast.success('Default address updated');
      fetchAddresses();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to set default address');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

return (
  <div className="min-h-screen bg-slate-950 py-8 text-white">
    <div className="max-w-4xl mx-auto px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3 text-white">
            <MapPin className="w-8 h-8 text-blue-500" />
            My Addresses
          </h1>
          <p className="text-slate-400 mt-1">
            Manage your delivery and billing addresses
          </p>
        </div>

        {!showForm && (
          <Button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Address
          </Button>
        )}
      </div>
      {showForm && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-6 shadow-lg">
          <h2 className="text-xl font-bold mb-6 text-white">
            {editingId ? "Edit Address" : "Add New Address"}
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label className="text-slate-300">Address Label *</Label>
                <Input
                  {...register("label")}
                  placeholder="Home"
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500"
                />
                {errors.label && (
                  <p className="text-red-400 text-xs mt-1">{errors.label.message}</p>
                )}
              </div>
              <div>
                <Label className="text-slate-300">Recipient Name *</Label>
                <Input
                  {...register("recipientName")}
                  placeholder="John Doe"
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500"
                />
                {errors.recipientName && (
                  <p className="text-red-400 text-xs mt-1">{errors.recipientName.message}</p>
                )}
              </div>
              <div>
                <Label className="text-slate-300">Phone Number *</Label>
                <Input
                  {...register("phone")}
                  placeholder="0123456789"
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500"
                />
                {errors.phone && (
                  <p className="text-red-400 text-xs mt-1">{errors.phone.message}</p>
                )}
              </div>
              <div className="md:col-span-2">
                <Label className="text-slate-300">Street Address *</Label>
                <Input
                  {...register("streetAddress")}
                  placeholder="123 Main Street"
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500"
                />
                {errors.streetAddress && (
                  <p className="text-red-400 text-xs mt-1">{errors.streetAddress.message}</p>
                )}
              </div>
              <div className="md:col-span-2">
                <Label className="text-slate-300">Apartment (optional)</Label>
                <Input
                  {...register("addressLine2")}
                  placeholder="Apt 4B"
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-400"
                />
              </div>
              <div>
                <Label className="text-slate-300">Suburb</Label>
                <Input
                  {...register("suburb")}
                  placeholder="Sandton"
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-400"
                />
              </div>
              <div>
                <Label className="text-slate-300">City *</Label>
                <Input
                  {...register("city")}
                  placeholder="Johannesburg"
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-400"
                />
                {errors.city && (
                  <p className="text-red-400 text-xs mt-1">{errors.city.message}</p>
                )}
              </div>
              <div>
                <Label className="text-slate-300">Province *</Label>
                <select
                  {...register("province")}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-md p-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Province</option>
                  <option value="Gauteng">Gauteng</option>
                  <option value="Western Cape">Western Cape</option>
                  <option value="Eastern Cape">Eastern Cape</option>
                  <option value="KwaZulu-Natal">KwaZulu-Natal</option>
                  <option value="Free State">Free State</option>
                  <option value="Limpopo">Limpopo</option>
                  <option value="Mpumalanga">Mpumalanga</option>
                  <option value="Northern Cape">Northern Cape</option>
                  <option value="North West">North West</option>
                </select>
              </div>
              <div>
                <Label className="text-slate-300">Postal Code *</Label>
                <Input
                  {...register("postalCode")}
                  placeholder="2000"
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-400"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
                className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {submitting
                  ? "Saving..."
                  : editingId
                  ? "Update Address"
                  : "Add Address"}
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {addresses.map((address) => (
          <div
            key={address.id}
            className={`bg-slate-900 border rounded-xl p-6 transition ${
              address.isDefault
                ? "border-blue-600 shadow-lg"
                : "border-slate-800"
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <MapPin className="w-5 h-5 text-blue-500" />
                  <span className="font-bold text-lg text-white">
                    {address.label}
                  </span>

                  {address.isDefault && (
                    <span className="px-3 py-1 bg-blue-600/20 text-blue-400 text-xs rounded-full border border-blue-500/30">
                      DEFAULT
                    </span>
                  )}
                </div>

                <div className="text-slate-300 space-y-1">
                  <p className="font-semibold text-white">
                    {address.recipientName}
                  </p>
                  <p>{address.streetAddress}</p>
                  {address.addressLine2 && <p>{address.addressLine2}</p>}
                  <p>
                    {address.suburb && `${address.suburb}, `}
                    {address.city}, {address.province} {address.postalCode}
                  </p>
                  <p className="text-sm text-slate-400">
                    📞 {address.phone}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(address)}
                  className="border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  <Edit className="w-4 h-4" />
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(address.id)}
                  className="border-slate-700 text-red-400 hover:bg-slate-800"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  </div>
);
}