import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Food } from "../types";
import { 
  Card, 
  CardContent, 
  Typography, 
  Input, 
  Button, 
  Stack, 
  Sheet, 
  Modal,
  ModalDialog,
  ModalClose,
  Divider,
  Alert,
  Box
} from "@mui/joy";
import { Icon } from "@iconify/react";

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

  const colors = {
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
          ...(type === 'loading' && {
            '& .MuiAlert-endDecorator': {
              display: 'none'
            }
          })
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
  const [page, setPage] = useState(1);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // Notification states
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    type: 'success' as 'success' | 'error' | 'loading'
  });
  
  const itemsPerPage = 5;
  const navigate = useNavigate();

  // Show notification
  const showNotification = (message: string, type: 'success' | 'error' | 'loading' = 'success') => {
    setNotification({ open: true, message, type });
    
    // Auto-close for success and error, but not for loading
    if (type !== 'loading') {
      setTimeout(() => {
        setNotification(prev => ({ ...prev, open: false }));
      }, 3000);
    }
  };

  // Close notification
  const closeNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  // Fetch food list
  useEffect(() => {
    if (!localStorage.getItem("admin")) {
      navigate("/");
      return;
    }

    fetch("/api/food")
      .then(res => res.json())
      .then((data: Food[]) => setList(data))
      .catch(err => {
        console.error(err);
        showNotification("Ot mean", "error");
      });
  }, [navigate]);

  // Add new food
  const addFood = async () => {
    if (!food) {
      showNotification("Dak chmous mor!", "error");
      return;
    }
    
    showNotification("Jam tix...", "loading");
    
    try {
      const res = await fetch("/api/food", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: food }),
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const newItem: Food = await res.json();
      setList(prev => [...prev, newItem]);
      setFood("");
      showNotification("Hzhz boss!");
    } catch (err) {
      console.error(err);
      showNotification("Add ot ban", "error");
    }
  };

  // Start editing a food item
  const startEdit = (index: number) => {
    const actualIndex = (page - 1) * itemsPerPage + index;
    setEditingId(actualIndex);
    setEditValue(list[actualIndex].name);
  };

  // Save edited food item
  const saveEdit = async (index: number) => {
    const actualIndex = (page - 1) * itemsPerPage + index;
    
    if (!editValue.trim()) {
      showNotification("Dak chmous mor!", "error");
      return;
    }
    
    showNotification("Pg kae hz...", "loading");
    
    try {
      const res = await fetch(`/api/food`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          id: list[actualIndex].id,
          name: editValue 
        }),
      });
      
      if (res.ok) {
        const updatedItem = await res.json();
        const newList = [...list];
        newList[actualIndex] = updatedItem;
        setList(newList);
        setEditingId(null);
        setEditValue("");
        showNotification("Hzhz boss!");
      } else {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
    } catch (err) {
      console.error(err);
      showNotification("Ot kert", "error");
    }
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingId(null);
    setEditValue("");
  };

  // Open delete confirmation modal
  const openDeleteModal = (index: number) => {
    setItemToDelete(index);
    setDeleteModalOpen(true);
  };

  // Close delete confirmation modal
  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setItemToDelete(null);
    setDeleteLoading(false);
  };

  // Delete food
  const deleteFood = async () => {
    if (itemToDelete === null) return;
    
    setDeleteLoading(true);
    showNotification("Pg tah lub...", "loading");
    
    const actualIndex = (page - 1) * itemsPerPage + itemToDelete;
    const foodId = list[actualIndex].id;
    
    try {
      const res = await fetch("/api/food", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: foodId }),
      });
      
      if (res.ok) {
        const newList = [...list];
        newList.splice(actualIndex, 1);
        setList(newList);
        closeDeleteModal();
        showNotification("Delete hz!");
      } else {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
    } catch (err) {
      console.error(err);
      showNotification("Lub ot kert", "error");
      setDeleteLoading(false);
    }
  };

  const paginatedList = list.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  // Get the food name for the confirmation modal
  const getFoodNameToDelete = () => {
    if (itemToDelete === null) return "";
    const actualIndex = (page - 1) * itemsPerPage + itemToDelete;
    return list[actualIndex]?.name || "";
  };

  return (
    <>
      <Stack justifyContent="center" alignItems="center" sx={{ minHeight: "100vh", p: 2, bgcolor: "background.body" }}>
        <Card sx={{ width: { xs: "100%", sm: 500 }, p: 2, boxShadow: "md" }}>
          <CardContent>
            <Typography level="h4" mb={2}>Admin Panel</Typography>

            {/* Input & Add Button */}
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1} mb={2}>
              <Input
                placeholder="Food name"
                value={food}
                onChange={(e) => setFood(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') addFood();
                }}
                sx={{ flex: 1 }}
              />
              <Button 
                onClick={addFood} 
                variant="solid" 
                color="primary"
                loading={notification.type === 'loading' && notification.message === "Adding food item..."}
              >
                Add
              </Button>
            </Stack>

            <Typography level="title-md" mb={1}>Food List:</Typography>

            {/* Food List */}
            <Stack spacing={1} width="100%">
              {paginatedList.map((f, i) => {
                const actualIndex = (page - 1) * itemsPerPage + i;
                const isEditing = editingId === actualIndex;
                
                return (
                  <Sheet
                    key={f.id || i}
                    variant="outlined"
                    sx={{
                      p: 1,
                      display: "flex",
                      flexDirection: { xs: "column", sm: "row" },
                      justifyContent: "space-between",
                      alignItems: "center",
                      borderRadius: "md",
                      bgcolor: "background.body",
                      width: "100%",
                      boxSizing: "border-box",
                    }}
                  >
                    {isEditing ? (
                      <Input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') saveEdit(i);
                          if (e.key === 'Escape') cancelEdit();
                        }}
                        sx={{ flex: 1, mr: 1 }}
                        autoFocus
                      />
                    ) : (
                      <Typography
                        sx={{
                          wordBreak: "break-word",
                          flex: 1,
                          minWidth: 0,
                        }}
                      >
                        {f.name}
                      </Typography>
                    )}
                    
                    <Stack direction="row" spacing={1} mt={{ xs: 1, sm: 0 }}>
                      {isEditing ? (
                        <>
                          <Button
                            variant="plain"
                            color="success"
                            size="sm"
                            onClick={() => saveEdit(i)}
                          >
                            <Icon icon="material-symbols:save" width={20} />
                          </Button>
                          <Button
                            variant="plain"
                            color="neutral"
                            size="sm"
                            onClick={cancelEdit}
                          >
                            <Icon icon="material-symbols:cancel" width={20} />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="plain"
                            color="neutral"
                            size="sm"
                            onClick={() => startEdit(i)}
                          >
                            <Icon icon="line-md:edit-full-twotone" width={20} />
                          </Button>
                          <Button
                            variant="plain"
                            color="danger"
                            size="sm"
                            onClick={() => openDeleteModal(i)}
                          >
                            <Icon icon="material-symbols:delete" width={20} />
                          </Button>
                        </>
                      )}
                    </Stack>
                  </Sheet>
                );
              })}
            </Stack>

            {/* Pagination */}
            <Stack direction="row" justifyContent="center" spacing={1} mt={2} flexWrap="wrap">
              {Array.from({ length: Math.ceil(list.length / itemsPerPage) }, (_, i) => (
                <Button
                  key={i}
                  size="sm"
                  variant={page === i + 1 ? "solid" : "outlined"}
                  color="primary"
                  onClick={() => setPage(i + 1)}
                >
                  {i + 1}
                </Button>
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Stack>

      {/* Delete Confirmation Modal */}
      <Modal open={deleteModalOpen} onClose={closeDeleteModal}>
        <ModalDialog variant="outlined" role="alertdialog" sx={{ maxWidth: 400 }}>
          <ModalClose onClick={closeDeleteModal} />
          <Typography level="h6" component="h2" mb={1}>
            Confirm Delete
          </Typography>
          <Divider sx={{ my: 1 }} />
          <Typography level="body-md" sx={{ mb: 2 }}>
            Lub Men Ten Men? <strong>"{getFoodNameToDelete()}"</strong>?
            Tah lub bat hz nah!
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button 
              variant="outlined" 
              color="neutral" 
              onClick={closeDeleteModal}
              disabled={deleteLoading}
            >
              Cancel
            </Button>
            <Button 
              variant="solid" 
              color="danger" 
              onClick={deleteFood}
              loading={deleteLoading}
              startDecorator={deleteLoading ? null : <Icon icon="material-symbols:delete" />}
            >
              {deleteLoading ? "Pg lub..." : "Delete"}
            </Button>
          </Stack>
        </ModalDialog>
      </Modal>

      {/* Notification */}
      <Notification 
        open={notification.open} 
        message={notification.message} 
        type={notification.type}
        onClose={closeNotification}
      />
    </>
  );
}