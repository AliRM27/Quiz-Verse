import React from "react";

export interface ButtonProps {
    title?: string;
    Logo?: any;
    onPress: () => void
}

export interface GradientProps {
    children: React.ReactNode;
    style?: any;
    color?: any;
}