// src/components/auth/PermissionGate.tsx
import React from "react";
import { checkPermission } from "@/lib/data/auth";

interface PermissionGateProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  fallback?: React.ReactNode;
}

export default function PermissionGate({ 
  children, 
  allowedRoles = ["admin"], 
  fallback = null 
}: PermissionGateProps) {
  
  if (!checkPermission(allowedRoles)) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}