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

// Define a local type that includes id
interface FoodWithId extends Food {
  id: string;
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

  // Use proper MUI Joy color values
  const getColor = () => {
    switch (type) {
      case 'success': return 'success';
      case 'error': return 'danger';
      case 'loading': return 'neutral';
      default: return 'neutral';
    }
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
        color={getColor()}
        variant="soft"
        startDecorator={icons[type]}
        endDecorator={
          type !== 'loading' && (
            <Button
              variant="plain"
              color={getColor()}
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
  const [list, setList] = useState<FoodWithId[]>([]); // Use FoodWithId instead of Food
  const [page, setPage] = useState(1);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  const logout = () => {
    localStorage.removeItem('admin');
    navigate('/login');
  };

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
      .then((data: FoodWithId[]) => setList(data)) // Use FoodWithId here
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

      const newItem: FoodWithId = await res.json(); // Use FoodWithId here
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
          id: list[actualIndex].id, // This should now work
          name: editValue 
        }),
      });
      
      if (res.ok) {
        const updatedItem: FoodWithId = await res.json(); // Use FoodWithId here
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
    const foodId = list[actualIndex].id; // This should now work
    
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
      <Stack justifyContent="center" alignItems="center" sx={{ 
        minHeight: "100vh", 
        p: { xs: 1, sm: 2 },
        bgcolor: "#000", 
        overflow: 'hidden',
        boxSizing: 'border-box'
      }}>
        <Button 
          onClick={logout}
          variant="outlined" 
          color="neutral"
          sx={{ 
            position: 'fixed', 
            top: { xs: 8, sm: 16 },
            right: { xs: 8, sm: 16 },
            zIndex: 1000,
            color: '#fff',
            borderColor: '#666',
            fontSize: { xs: '12px', sm: 'inherit' },
            px: { xs: 1, sm: 2 },
            '&:hover': {
              borderColor: '#888',
              bgcolor: '#2a2a2a'
            }
          }}
        >
          Logout
        </Button>
        <Card sx={{ 
          width: { xs: "100%", sm: 500 }, 
          p: { xs: 1.5, sm: 2 },
          boxShadow: "md", 
          bgcolor: "#121212",
          maxWidth: '100%',
          overflow: 'visible',
          mx: { xs: 0.5, sm: 0 }
        }}>
          <CardContent sx={{ 
            overflow: 'visible',
            p: { xs: 1, sm: 0 }
          }}>
            <Typography level="h4" mb={2} sx={{ 
              color: "#fff", 
              textAlign: 'center',
              fontSize: { xs: '1.5rem', sm: 'inherit' }
            }}>
              Admin Panel
            </Typography>

            {/* Input & Add Button */}
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1} mb={2}>
              <Input
                placeholder="Food name"
                value={food}
                onChange={(e) => setFood(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') addFood();
                }}
                sx={{ 
                  flex: 1,
                  '& input': {
                    fontSize: { xs: '16px', sm: 'inherit' },
                    px: { xs: 1, sm: 2 }
                  }
                }}
              />
              <Button 
                onClick={addFood} 
                variant="solid" 
                color="primary"
                sx={{ 
                  minWidth: '80px',
                  fontSize: { xs: '14px', sm: 'inherit' }
                }}
              >
                Add
              </Button>
            </Stack>

            <Typography level="title-md" mb={1} sx={{ 
              color: "#fff",
              fontSize: { xs: '1rem', sm: 'inherit' }
            }}>
              Food List:
            </Typography>

            {/* Food List Container with fixed height and scroll */}
            <Box sx={{ 
              maxHeight: { xs: '50vh', sm: '60vh' }, 
              overflowY: 'auto',
              mb: 2,
              pr: { xs: 0.5, sm: 1 },
              '&::-webkit-scrollbar': {
                width: '6px',
              },
              '&::-webkit-scrollbar-track': {
                background: '#2a2a2a',
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#555',
                borderRadius: '4px',
              }
            }}>
              <Stack spacing={1} width="100%">
                {paginatedList.map((f, i) => {
                  const actualIndex = (page - 1) * itemsPerPage + i;
                  const isEditing = editingId === actualIndex;
                  
                  return (
                    <Sheet
                      key={f.id || i} 
                      variant="outlined"
                      sx={{
                        p: { xs: 0.75, sm: 1 },
                        display: "flex",
                        flexDirection: { xs: "column", sm: "row" },
                        justifyContent: "space-between",
                        alignItems: "center",
                        borderRadius: "md",
                        width: "100%",
                        boxSizing: "border-box",
                        bgcolor: "#1e1e1e",
                        borderColor: "#333",
                        minHeight: '60px',
                        mx: { xs: 0, sm: 0 }
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
                          sx={{ 
                            flex: 1, 
                            mr: { sm: 1 },
                            mb: { xs: 1, sm: 0 },
                            width: '100%',
                            '& input': {
                              fontSize: { xs: '16px', sm: 'inherit' },
                              px: { xs: 1, sm: 2 }
                            }
                          }}
                          autoFocus
                        />
                      ) : (
                        <Typography
                          sx={{
                            wordBreak: "break-word",
                            flex: 1,
                            minWidth: 0,
                            color: "#fff",
                            fontSize: { xs: '14px', sm: 'inherit' },
                            px: { xs: 0.5, sm: 0 },
                            textAlign: { xs: 'center', sm: 'left' }
                          }}
                        >
                          {f.name}
                        </Typography>
                      )}
                      
                      <Stack 
                        direction="row" 
                        spacing={1} 
                        sx={{ 
                          width: { xs: '100%', sm: 'auto' },
                          justifyContent: { xs: 'center', sm: 'flex-start' },
                          mt: { xs: 1, sm: 0 }
                        }}
                      >
                        {isEditing ? (
                          <>
                            <Button
                              variant="soft"
                              color="success"
                              size="sm"
                              onClick={() => saveEdit(i)}
                              sx={{ 
                                minWidth: 'auto',
                                px: { xs: 1, sm: 2 }
                              }}
                            >
                              <Icon icon="material-symbols:save" width={20} />
                            </Button>
                            <Button
                              variant="soft"
                              color="neutral"
                              size="sm"
                              onClick={cancelEdit}
                              sx={{ 
                                minWidth: 'auto',
                                px: { xs: 1, sm: 2 }
                              }}
                            >
                              <Icon icon="material-symbols:cancel" width={20} />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              variant="soft"
                              color="neutral"
                              size="sm"
                              onClick={() => startEdit(i)}
                              sx={{ 
                                minWidth: 'auto',
                                px: { xs: 1, sm: 2 }
                              }}
                            >
                              <Icon icon="line-md:edit-full-twotone" width={20} />
                            </Button>
                            <Button
                              variant="soft"
                              color="danger"
                              size="sm"
                              onClick={() => openDeleteModal(i)}
                              sx={{ 
                                minWidth: 'auto',
                                px: { xs: 1, sm: 2 }
                              }}
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
            </Box>

            {/* Pagination */}
            {list.length > itemsPerPage && (
              <Stack direction="row" justifyContent="center" spacing={1} mt={2} flexWrap="wrap">
                {Array.from({ length: Math.ceil(list.length / itemsPerPage) }, (_, i) => (
                  <Button
                    key={i}
                    size="sm"
                    variant={page === i + 1 ? "solid" : "outlined"}
                    color="primary"
                    onClick={() => setPage(i + 1)}
                    sx={{ 
                      minWidth: { xs: '32px', sm: '36px' }, 
                      height: { xs: '32px', sm: '36px' },
                      fontSize: { xs: '12px', sm: '14px' }
                    }}
                  >
                    {i + 1}
                  </Button>
                ))}
              </Stack>
            )}
          </CardContent>
        </Card>
      </Stack>

      {/* Delete Confirmation Modal - Mobile Optimized */}
      <Modal open={deleteModalOpen} onClose={closeDeleteModal}>
        <ModalDialog 
          variant="outlined" 
          role="alertdialog" 
          sx={{ 
            maxWidth: 400,
            width: '90%',
            mx: 'auto',
            bgcolor: '#121212',
            color: '#fff',
            p: { xs: 2, sm: 3 }
          }}
        >
          <ModalClose onClick={closeDeleteModal} sx={{ color: '#fff' }} />
          <Typography level="title-lg" component="h2" mb={1} sx={{ color: '#fff' }}>
            Confirm Delete
          </Typography>
          <Divider sx={{ my: 1, bgcolor: '#333' }} />
          <Typography level="body-md" sx={{ mb: 2, color: '#fff' }}>
            Lub Men Ten Men? <strong>"{getFoodNameToDelete()}"</strong>?
            Tah lub bat hz nah!
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button 
              variant="outlined" 
              color="neutral" 
              onClick={closeDeleteModal}
              disabled={deleteLoading}
              sx={{ 
                color: '#fff', 
                borderColor: '#666',
                fontSize: { xs: '12px', sm: 'inherit' }
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="solid" 
              color="danger" 
              onClick={deleteFood}
              loading={deleteLoading}
              sx={{ fontSize: { xs: '12px', sm: 'inherit' } }}
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