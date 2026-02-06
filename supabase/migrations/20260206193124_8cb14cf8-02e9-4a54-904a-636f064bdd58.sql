-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Admins can manage revenue summary" ON public.revenue_summary;

-- Create specific policies for each operation
CREATE POLICY "Admins can insert revenue summary"
ON public.revenue_summary
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update revenue summary"
ON public.revenue_summary
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete revenue summary"
ON public.revenue_summary
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));