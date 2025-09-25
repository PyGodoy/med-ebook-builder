-- Create a function to set up the first admin user
-- This will be used to promote the first user who signs up to admin
CREATE OR REPLACE FUNCTION public.setup_first_admin()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_count INTEGER;
BEGIN
  -- Check if there are any admin users
  SELECT COUNT(*) INTO admin_count
  FROM public.user_roles 
  WHERE role = 'admin' AND is_active = true;
  
  -- If no admin exists, make this user an admin
  IF admin_count = 0 THEN
    -- Add admin role to the new user
    INSERT INTO public.user_roles (user_id, role, is_active)
    VALUES (NEW.user_id, 'admin', true);
    
    -- Also keep the client role
    -- The existing trigger already adds the client role
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to automatically make first user admin
CREATE TRIGGER setup_first_admin_trigger
AFTER INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.setup_first_admin();