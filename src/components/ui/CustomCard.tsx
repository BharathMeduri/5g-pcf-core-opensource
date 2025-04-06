
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface CustomCardProps {
  title: string;
  description?: string;
  className?: string;
  containerClassName?: string;
  headerClassName?: string;
  contentClassName?: string;
  footerClassName?: string;
  headerExtra?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
}

const CustomCard: React.FC<CustomCardProps> = ({
  title,
  description,
  className,
  containerClassName,
  headerClassName,
  contentClassName,
  footerClassName,
  headerExtra,
  footer,
  children,
}) => {
  return (
    <div className={cn("w-full", containerClassName)}>
      <Card className={cn("shadow-sm border border-gray-100", className)}>
        <CardHeader className={cn("flex flex-row items-center justify-between pb-2", headerClassName)}>
          <div>
            <CardTitle className="text-lg font-medium">{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          {headerExtra}
        </CardHeader>
        <CardContent className={cn("pt-2", contentClassName)}>{children}</CardContent>
        {footer && <CardFooter className={cn("pt-2 border-t border-gray-100", footerClassName)}>{footer}</CardFooter>}
      </Card>
    </div>
  );
};

export default CustomCard;
