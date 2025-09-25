import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Shield, Users, UserCheck, UserX } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

interface UserWithRole {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  role: string;
  is_active: boolean;
  role_id: string;
}

const AccessControl = () => {
  const { user, loading, isAdmin } = useAuth();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (user && isAdmin) {
      fetchUsers();
    }
  }, [user, isAdmin]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          user_id,
          full_name,
          created_at,
          user_roles!inner (
            id,
            role,
            is_active
          )
        `);

      if (error) throw error;

      // For now, we'll use a simpler approach without auth.admin
      // Get user emails from the session (limited to current capabilities)
      
      const usersWithRoles = data?.map(profile => {
        const userRole = Array.isArray(profile.user_roles) ? profile.user_roles[0] : profile.user_roles;
        
        return {
          id: profile.user_id,
          email: 'email@example.com', // Placeholder - would need admin access for real emails
          full_name: profile.full_name || '',
          created_at: profile.created_at,
          role: userRole?.role || 'client',
          is_active: userRole?.is_active || false,
          role_id: userRole?.id || ''
        };
      }) || [];

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os usuários.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleUserAccess = async (userId: string, roleId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ is_active: !currentStatus })
        .eq('id', roleId);

      if (error) throw error;

      setUsers(users.map(u => 
        u.id === userId ? { ...u, is_active: !currentStatus } : u
      ));

      toast({
        title: !currentStatus ? "Acesso liberado" : "Acesso bloqueado",
        description: !currentStatus 
          ? "O usuário agora pode acessar o sistema." 
          : "O usuário foi bloqueado do sistema.",
      });
    } catch (error) {
      console.error('Error toggling user access:', error);
      toast({
        title: "Erro",
        description: "Não foi possível alterar o acesso do usuário.",
        variant: "destructive",
      });
    }
  };

  const promoteToAdmin = async (userId: string) => {
    if (!confirm('Tem certeza que deseja promover este usuário a administrador?')) return;

    try {
      // Check if user already has admin role
      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .single();

      if (existingRole) {
        toast({
          title: "Usuário já é admin",
          description: "Este usuário já possui permissões de administrador.",
          variant: "destructive",
        });
        return;
      }

      // Add admin role
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: 'admin',
          is_active: true
        });

      if (error) throw error;

      toast({
        title: "Usuário promovido",
        description: "O usuário agora é um administrador.",
      });

      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error('Error promoting user:', error);
      toast({
        title: "Erro",
        description: "Não foi possível promover o usuário.",
        variant: "destructive",
      });
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link to="/admin">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6" />
              <h1 className="text-2xl font-bold">Controle de Acesso</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5" />
            <h2 className="text-2xl font-bold">Gerenciar Usuários</h2>
          </div>
          <p className="text-muted-foreground">
            Controle quem tem acesso ao painel administrativo
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Usuários</CardTitle>
            <CardDescription>
              Todos os usuários cadastrados no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Nenhum usuário encontrado.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Cadastro</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium">
                          {u.full_name || 'Não informado'}
                        </TableCell>
                        <TableCell>{u.email}</TableCell>
                        <TableCell>
                          <Badge variant={u.role === 'admin' ? 'default' : 'secondary'}>
                            {u.role === 'admin' ? 'Administrador' : 'Cliente'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={u.is_active ? 'default' : 'destructive'}>
                            {u.is_active ? 'Ativo' : 'Bloqueado'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(u.created_at).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {u.role !== 'admin' && (
                              <>
                                <Button
                                  variant={u.is_active ? "destructive" : "default"}
                                  size="sm"
                                  onClick={() => toggleUserAccess(u.id, u.role_id, u.is_active)}
                                >
                                  {u.is_active ? (
                                    <>
                                      <UserX className="w-4 h-4 mr-1" />
                                      Bloquear
                                    </>
                                  ) : (
                                    <>
                                      <UserCheck className="w-4 h-4 mr-1" />
                                      Liberar
                                    </>
                                  )}
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => promoteToAdmin(u.id)}
                                >
                                  <Shield className="w-4 h-4 mr-1" />
                                  Promover
                                </Button>
                              </>
                            )}
                            {u.role === 'admin' && u.id !== user.id && (
                              <span className="text-sm text-muted-foreground">Administrador</span>
                            )}
                            {u.id === user.id && (
                              <span className="text-sm text-muted-foreground">Você</span>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AccessControl;