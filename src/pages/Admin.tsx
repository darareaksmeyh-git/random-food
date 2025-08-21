import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Card, CardContent, Typography, Input, Button, Stack, Sheet, 
  Modal, ModalDialog, ModalClose, Divider, Alert, Box 
} from "@mui/joy";
import { Icon } from "@iconify/react";
import { supabase } from "../../supabaseClient";


interface Food {
  id: number;
  name: string;
}

// Notification component
interface NotificationProps {
  open: boolean;
  message: string;
  type: 'success' | 'error' | 'loading';
  onClose: () => void;
}
function Notification({ open, message, type, onClose }: NotificationProps) {
  if (!open) return null;

  const icons = {
    success: <Icon icon="clarity:success-standard-line" style={{ color: '#2e7d32', fontSize: '20px' }} />,
    error: <Icon icon="ion:warning" style={{ color: '#d32f2f', fontSize: '20px' }} />,
    loading: <Icon icon="line-md:loading-loop" style={{ fontSize: '20px' }} />
  };

 const colors: Record<'success' | 'error' | 'loading', 'success' | 'danger' | 'neutral'> = {
  success: 'success',
  error: 'danger',
  loading: 'neutral'
};

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 20,
        right: 20,
        zIndex: 9999,
        animation: 'slideIn 0.3s ease-out',
        '@keyframes slideIn': {
          from: { transform: 'translateX(100%)', opacity: 0 },
          to: { transform: 'translateX(0)', opacity: 1 }
        }
      }}
    >
      <Alert
        color={colors[type]}
        variant="soft"
        startDecorator={icons[type]}
        endDecorator={
          type !== 'loading' && (
            <Button
              variant="plain"
              color={colors[type]}
              size="sm"
              onClick={onClose}
              sx={{ minHeight: 'auto', p: 0.5 }}
            >
              <Icon icon="material-symbols:close" width={16} />
            </Button>
          )
        }
        sx={{ 
          boxShadow: 'md', 
          minWidth: 300,
          ...(type === 'loading' && { '& .MuiAlert-endDecorator': { display: 'none' } })
        }}
      >
        {message}
      </Alert>
    </Box>
  );
}

export default function Admin() {
  const [food, setFood] = useState("");
  const [list, setList] = useState<Food[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    type: 'success' as 'success' | 'error' | 'loading'
  });
  const navigate = useNavigate();
  const itemsPerPage = 5;
  const [page, setPage] = useState(1);

  // Notification helpers
  const showNotification = (message: string, type: 'success' | 'error' | 'loading' = 'success') => {
    setNotification({ open: true, message, type });
    if (type !== 'loading') setTimeout(() => setNotification(prev => ({ ...prev, open: false })), 3000);
  };
  const closeNotification = () => setNotification(prev => ({ ...prev, open: false }));

  // Logout
  const logout = () => {
    localStorage.removeItem('admin');
    navigate('/login');
  };

  // Fetch foods
  const fetchFoods = async () => {
    const { data, error } = await supabase.from('foods').select('*').order('id', { ascending: true });
    if (error) {
      console.error(error);
      showNotification("Ot mean", "error");
    } else {
      setList(data || []);
    }
  };

  useEffect(() => {
    if (!localStorage.getItem("admin")) {
      navigate("/login");
      return;
    }
    fetchFoods();
  }, [navigate]);

  // Add food
  const addFood = async () => {
    if (!food.trim()) { showNotification("Dak chmous mor!", "error"); return; }
    showNotification("Jam tix...", "loading");
    const { data, error } = await supabase.from('foods').insert([{ name: food }]).select();
    if (error) {
      console.error(error);
      if (error.code === '23505') {
      showNotification("Mean hz boss", "error");
      } else
      showNotification("Add ot ban", "error");
    } else {
      setList(prev => [...prev, data[0]]);
      setFood("");
      showNotification("Hzhz boss!");
    }
  };

  // Edit food
  const startEdit = (index: number) => {
    const actualIndex = (page - 1) * itemsPerPage + index;
    setEditingId(actualIndex);
    setEditValue(list[actualIndex].name);
  };
  const saveEdit = async (index: number) => {
    const actualIndex = (page - 1) * itemsPerPage + index;
    if (!editValue.trim()) { showNotification("Dak chmous mor!", "error"); return; }
    showNotification("Pg kae hz...", "loading");
    const { data, error } = await supabase.from('foods').update({ name: editValue }).eq('id', list[actualIndex].id).select();
    if (error) { console.error(error); showNotification("Ot kert", "error"); }
    else { const newList = [...list]; newList[actualIndex] = data[0]; setList(newList); setEditingId(null); setEditValue(""); showNotification("Hzhz boss!"); }
  };
  const cancelEdit = () => { setEditingId(null); setEditValue(""); };

  // Delete food
  const openDeleteModal = (index: number) => { setItemToDelete(index); setDeleteModalOpen(true); };
  const closeDeleteModal = () => { setDeleteModalOpen(false); setItemToDelete(null); setDeleteLoading(false); };
  const deleteFood = async () => {
    if (itemToDelete === null) return;
    setDeleteLoading(true);
    showNotification("Pg tah lub...", "loading");
    const actualIndex = (page - 1) * itemsPerPage + itemToDelete;
    const { error } = await supabase.from('foods').delete().eq('id', list[actualIndex].id);
    if (error) { console.error(error); showNotification("Lub ot kert", "error"); setDeleteLoading(false); }
    else { const newList = [...list]; newList.splice(actualIndex, 1); setList(newList); closeDeleteModal(); showNotification("Delete hz!"); }
  };

  const paginatedList = list.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const getFoodNameToDelete = () => {
    if (itemToDelete === null) return "";
    const actualIndex = (page - 1) * itemsPerPage + itemToDelete;
    return list[actualIndex]?.name || "";
  };

  return (
    <>
      <Stack justifyContent="center" alignItems="center" sx={{ minHeight: "100vh", p: 2, bgcolor: "#000", overflow: 'hidden' }}>
        <Button onClick={logout} variant="outlined" color="neutral" sx={{ position: 'fixed', top: 16, right: 16, zIndex: 1000, color: '#fff', borderColor: '#666', '&:hover': { borderColor: '#888', bgcolor: '#2a2a2a' } }}>Logout</Button>

        <Card sx={{ width: { xs: "100%", sm: 500 }, p: 2, boxShadow: "md", bgcolor: "#121212", maxWidth: '100%', overflow: 'visible' }}>
          <CardContent sx={{ overflow: 'visible' }}>
            <Typography level="h4" mb={2} sx={{ color: "#fff", textAlign: 'center' }}>Admin Panel</Typography>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1} mb={2}>
              <Input placeholder="Food name" value={food} onChange={e => setFood(e.target.value)} onKeyPress={e => { if (e.key === 'Enter') addFood(); }} sx={{ flex: 1, '& input': { fontSize: { xs: '16px', sm: 'inherit' } } }} />
              <Button onClick={addFood} variant="solid" color="primary" sx={{ minWidth: '80px' }}>Add</Button>
            </Stack>

            <Typography level="title-md" mb={1} sx={{ color: "#fff" }}>Food List:</Typography>

            <Box sx={{ maxHeight: { xs: '50vh', sm: '60vh' }, overflowY: 'auto', mb: 2, pr: 1, '&::-webkit-scrollbar': { width: '8px' }, '&::-webkit-scrollbar-track': { background: '#2a2a2a', borderRadius: '4px' }, '&::-webkit-scrollbar-thumb': { background: '#555', borderRadius: '4px' } }}>
              <Stack spacing={1} width="100%">
                {paginatedList.map((f, i) => {
                  const actualIndex = (page - 1) * itemsPerPage + i;
                  const isEditing = editingId === actualIndex;
                  return (
                    <Sheet key={f.id || i} variant="outlined" sx={{ p: 1, display: "flex", flexDirection: { xs: "column", sm: "row" }, justifyContent: "space-between", alignItems: "center", borderRadius: "md", width: "100%", boxSizing: "border-box", bgcolor: "#1e1e1e", borderColor: "#333", minHeight: '60px' }}>
                      {isEditing ? (
                        <Input value={editValue} onChange={e => setEditValue(e.target.value)} onKeyPress={e => { if (e.key === 'Enter') saveEdit(i); if (e.key === 'Escape') cancelEdit(); }} sx={{ flex: 1, mr: { sm: 1 }, mb: { xs: 1, sm: 0 }, width: '100%', '& input': { fontSize: { xs: '16px', sm: 'inherit' } } }} autoFocus />
                      ) : (
                        <Typography sx={{ wordBreak: "break-word", flex: 1, minWidth: 0, color: "#fff", fontSize: { xs: '14px', sm: 'inherit' }, px: { xs: 0.5, sm: 0 } }}>{f.name}</Typography>
                      )}

                      <Stack direction="row" spacing={1} sx={{ width: { xs: '100%', sm: 'auto' }, justifyContent: { xs: 'flex-end', sm: 'flex-start' }, mt: { xs: 1, sm: 0 } }}>
                        {isEditing ? (
                          <>
                            <Button variant="soft" color="success" size="sm" onClick={() => saveEdit(i)} sx={{ minWidth: 'auto' }}><Icon icon="material-symbols:save" width={20} /></Button>
                            <Button variant="soft" color="neutral" size="sm" onClick={cancelEdit} sx={{ minWidth: 'auto' }}><Icon icon="material-symbols:cancel" width={20} /></Button>
                          </>
                        ) : (
                          <>
                            <Button variant="soft" color="neutral" size="sm" onClick={() => startEdit(i)} sx={{ minWidth: 'auto' }}><Icon icon="line-md:edit-full-twotone" width={20} /></Button>
                            <Button variant="soft" color="danger" size="sm" onClick={() => openDeleteModal(i)} sx={{ minWidth: 'auto' }}><Icon icon="material-symbols:delete" width={20} /></Button>
                          </>
                        )}
                      </Stack>
                    </Sheet>
                  );
                })}
              </Stack>
            </Box>

            {list.length > itemsPerPage && (
              <Stack direction="row" justifyContent="center" spacing={1} mt={2} flexWrap="wrap">
                {Array.from({ length: Math.ceil(list.length / itemsPerPage) }, (_, i) => (
                  <Button key={i} size="sm" variant={page === i + 1 ? "solid" : "outlined"} color="primary" onClick={() => setPage(i + 1)} sx={{ minWidth: '36px', height: '36px', fontSize: '14px' }}>{i + 1}</Button>
                ))}
              </Stack>
            )}
          </CardContent>
        </Card>
      </Stack>

      <Modal open={deleteModalOpen} onClose={closeDeleteModal}>
        <ModalDialog variant="outlined" role="alertdialog" sx={{ maxWidth: 400, width: '90%', mx: 'auto', bgcolor: '#121212', color: '#fff' }}>
          <ModalClose onClick={closeDeleteModal} sx={{ color: '#fff' }} />
          <Typography level="title-md" component="h2" mb={1} sx={{ color: '#fff' }}>Confirm Delete</Typography>
          <Divider sx={{ my: 1, bgcolor: '#333' }} />
          <Typography level="body-md" sx={{ mb: 2, color: '#fff' }}>Lub Men Ten Men? <strong>"{getFoodNameToDelete()}"</strong>? Tah lub bat hz nah!</Typography>
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button variant="outlined" color="neutral" onClick={closeDeleteModal} disabled={deleteLoading} sx={{ color: '#fff', borderColor: '#666' }}>Cancel</Button>
            <Button variant="solid" color="danger" onClick={deleteFood} loading={deleteLoading} startDecorator={deleteLoading ? null : <Icon icon="material-symbols:delete" />}>{deleteLoading ? "Pg lub..." : "Delete"}</Button>
          </Stack>
        </ModalDialog>
      </Modal>

      <Notification open={notification.open} message={notification.message} type={notification.type} onClose={closeNotification} />
    </>
  );
}
