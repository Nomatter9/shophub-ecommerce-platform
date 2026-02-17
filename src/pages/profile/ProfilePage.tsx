import axiosClient from "@/axiosClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { passwordSchema, profileSchema, ProfileValues, PasswordValues } from "@/schemas/profileSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Camera, Eye, EyeOff, Flag, Loader2, Mail, Phone } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function ProfilePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openChangePassword, setOpenChangePassword] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Get user from localStorage
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : {
      firstName: "",
      lastName: "",
      email: "",
      profilePicture: "",
      phone: ""
    };
  });

  const profileForm = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      phone: user.phone || "",
    },
  });

  const passwordForm = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Reset form when user changes
  useEffect(() => {
    profileForm.reset({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      phone: user.phone || "",
    });
  }, [user]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("File size must be less than 2MB");
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error("Only image files are allowed");
        return;
      }

      setSelectedFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        // Update preview only (don't set in form)
        setUser((prev: any) => ({ ...prev, profilePicture: reader.result as string }));
        toast.info("Image selected. Click save to upload.");
      };
      reader.readAsDataURL(file);
    }
  };

  const onProfileSubmit = async (data: ProfileValues) => {
    setLoading(true);
    try {
      const formData = new FormData();
      
      formData.append('firstName', data.firstName);
      formData.append('lastName', data.lastName);
      formData.append('email', data.email);
      formData.append('phone', data.phone || '');
      
      if (selectedFile) {
        formData.append('profilePicture', selectedFile);
      }

      const response = await axiosClient.put("/auth/update-profile", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Update local state and localStorage
      setUser(response.data.user);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      
      setSelectedFile(null);
      toast.success("Profile updated successfully!");
      setOpenEdit(false);
    } catch (err: any) {
      console.error('Profile update error:', err);
      toast.error(err.response?.data?.message || "Update failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordValues) => {
    setLoading(true);
    try {
      await axiosClient.put("/auth/change-password", {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      });
      
      toast.success("Password changed successfully!");
      passwordForm.reset();
      setOpenChangePassword(false);
    } catch (err: any) {
      console.error('Password change error:', err);
      toast.error(err.response?.data?.message || "Error changing password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070D1D] p-4 md:p-8 text-white">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <Card className="bg-[#0B1632]/90 border-white/[0.06] rounded-[2rem] overflow-hidden shadow-2xl">
          <CardContent className="p-0">
            <div className="p-8 flex flex-col md:flex-row items-center gap-8 border-b border-white/[0.06]">
              <div className="relative group">
                <div className="w-32 h-32 rounded-[2.5rem] bg-[#6366F1] flex items-center justify-center text-4xl font-black overflow-hidden border-4 border-[#0B1632]">
                  {user.profilePicture ? (
                    <img 
                    //@ts-ignore
                      src={user.profilePicture.startsWith('data:') ? user.profilePicture : `${import.meta.env.VITE_STATIC_FILE_URL}${user.profilePicture}`} 
                      className="w-full h-full object-cover" 
                      alt="Profile" 
                    />
                  ) : (
                    <span>{user.firstName?.charAt(0)?.toUpperCase() || 'U'}{user.lastName?.charAt(0)?.toUpperCase() || ''}</span>
                  )}
                </div>
                <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()} 
                  className="absolute -bottom-2 -right-2 bg-[#6366F1] p-3 rounded-2xl border-4 border-[#0B1632] hover:bg-[#5558E3] transition-colors shadow-lg"
                >
                  <Camera className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 text-center md:text-left">
                <h2 className="text-3xl font-bold tracking-tight">{user.firstName} {user.lastName}</h2>
                <div className="flex items-center justify-center md:justify-start gap-2 text-[#9AA4C6] mt-1">
                  <Mail size={16} /> <span>{user.email}</span>
                </div>
                <div className="flex items-center justify-center md:justify-start gap-2 text-[#9AA4C6] mt-1">
                  <Phone size={16} /> <span>{user.phone || 'No phone number'}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button 
                  onClick={() => { setOpenEdit(!openEdit); setOpenChangePassword(false); }} 
                  className="bg-[#6366F1] hover:bg-[#5558E3] font-bold px-6 rounded-xl"
                >
                  {openEdit ? "Close" : "Edit Profile"}
                </Button>
                <Button 
                  onClick={() => { setOpenChangePassword(!openChangePassword); setOpenEdit(false); }} 
                  variant="outline" 
                  className="border-white/10 hover:bg-white/5 font-bold px-6 rounded-xl"
                >
                  Password
                </Button>
              </div>
            </div>

            {openEdit && (
              <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="p-8 bg-[#0F1A37]/50 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-xs uppercase font-bold tracking-widest text-[#9AA4C6]">First Name</Label>
                    <Input {...profileForm.register("firstName")} className="h-12 bg-[#0B1632] border-white/5 focus:border-[#6366F1]/50" />
                    {profileForm.formState.errors.firstName && <p className="text-red-400 text-xs mt-1">{profileForm.formState.errors.firstName.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase font-bold tracking-widest text-[#9AA4C6]">Last Name</Label>
                    <Input {...profileForm.register("lastName")} className="h-12 bg-[#0B1632] border-white/5 focus:border-[#6366F1]/50" />
                    {profileForm.formState.errors.lastName && <p className="text-red-400 text-xs mt-1">{profileForm.formState.errors.lastName.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase font-bold tracking-widest text-[#9AA4C6]">Email</Label>
                    <Input {...profileForm.register("email")} className="h-12 bg-[#0B1632] border-white/5 focus:border-[#6366F1]/50" />
                    {profileForm.formState.errors.email && <p className="text-red-400 text-xs mt-1">{profileForm.formState.errors.email.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase font-bold tracking-widest text-[#9AA4C6]">Phone</Label>
                    <Input {...profileForm.register("phone")} className="h-12 bg-[#0B1632] border-white/5 focus:border-[#6366F1]/50" placeholder="+27 123 456 789" />
                    {profileForm.formState.errors.phone && <p className="text-red-400 text-xs mt-1">{profileForm.formState.errors.phone.message}</p>}
                  </div>
                </div>
               <div className="flex gap-4">
                <Button type="button" variant="ghost" onClick={() => { setOpenEdit(false); profileForm.reset(); setSelectedFile(null); }}>Cancel</Button>
                <Button type="submit" disabled={loading} className="bg-[#6366F1] min-w-[140px]">
                  {loading ? <><Loader2 className="animate-spin mr-2" size={18} />Saving...</> : "Save Changes"}
                </Button>
              </div>
              </form>
            )}

            {openChangePassword && (
              <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="p-8 bg-[#0F1A37]/50 space-y-6">
                <div className="max-w-md space-y-6">
                  <div className="space-y-2">
                    <Label className="text-xs uppercase font-bold tracking-widest text-[#9AA4C6]">Current Password</Label>
                    <div className="relative">
                      <Input 
                        type={showCurrentPassword ? "text" : "password"} 
                        {...passwordForm.register("currentPassword")} 
                        className="h-12 bg-[#0B1632] border-white/5 pr-12 focus:border-[#6366F1]/50" 
                      />
                      <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9AA4C6] hover:text-white">
                        {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {passwordForm.formState.errors.currentPassword && <p className="text-red-400 text-xs mt-1">{passwordForm.formState.errors.currentPassword.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs uppercase font-bold tracking-widest text-[#9AA4C6]">New Password</Label>
                    <div className="relative">
                      <Input 
                        type={showPassword ? "text" : "password"} 
                        {...passwordForm.register("newPassword")} 
                        className="h-12 bg-[#0B1632] border-white/5 pr-12 focus:border-[#6366F1]/50" 
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9AA4C6] hover:text-white">
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {passwordForm.formState.errors.newPassword && <p className="text-red-400 text-xs mt-1">{passwordForm.formState.errors.newPassword.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs uppercase font-bold tracking-widest text-[#9AA4C6]">Confirm Password</Label>
                    <Input 
                      type={showPassword ? "text" : "password"} 
                      {...passwordForm.register("confirmPassword")} 
                      className="h-12 bg-[#0B1632] border-white/5 focus:border-[#6366F1]/50" 
                    />
                    {passwordForm.formState.errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{passwordForm.formState.errors.confirmPassword.message}</p>}
                  </div>

                  <div className="flex gap-4">
                                
            <div className="flex gap-4">
              <Button type="button" variant="ghost" onClick={() => { setOpenChangePassword(false); passwordForm.reset(); }}>Cancel</Button>
              <Button type="submit" disabled={loading} className="bg-[#6366F1] min-w-[160px]">
                {loading ? <><Loader2 className="animate-spin mr-2" size={18} />Updating...</> : "Update Password"}
              </Button>
            </div>                  </div>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}