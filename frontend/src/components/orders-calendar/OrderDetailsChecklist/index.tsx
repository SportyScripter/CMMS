import React from "react";
import { Loader2 } from "lucide-react";
import { OrderDetailsChecklistModalProps } from "../../../types/order-calendar";

// Hook and Subcomponents
import { useOrderDetails } from "./useOrderDetails";
import { OrderHeader } from "./components/OrderHeader";
import { OrderEditForm } from "./components/OrderEditForm";
import { OrderExecutionView } from "./components/OrderExecutionView";
import { OrderFooter } from "./components/OrderFooter";

// Shared modal (assuming it's in the parent folder)
import { AddChecklistItemsModal } from "../AddChecklistItemsModal";

export const OrderDetailsChecklistModal: React.FC<OrderDetailsChecklistModalProps> = ({
  orderId,
  isOpen,
  onClose,
  onUpdated,
}) => {
  const details = useOrderDetails(orderId, isOpen, onClose, onUpdated);

  // Early return if modal is closed or data is missing
  if (!isOpen || (!details.isLoading && !details.order)) return null;

  const { order } = details;

  return (
    <>
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl flex flex-col max-h-[95vh] animate-in fade-in duration-200">
          
          {/* Header Section */}
          {order && (
            <OrderHeader
              order={order}
              canEditGlobalDetails={details.canEditGlobalDetails}
              isEditMode={details.isEditMode}
              handleEnableEditMode={details.handleEnableEditMode}
              onClose={onClose}
            />
          )}

          {/* Main Body Section */}
          <div className="p-6 overflow-y-auto flex-1 bg-gray-50/50">
            {details.isLoading ? (
              <div className="flex flex-col items-center justify-center h-40">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
                <span className="text-gray-500">Pobieranie danych...</span>
              </div>
            ) : details.isEditMode ? (
              <OrderEditForm
                saveEditedDetails={details.saveEditedDetails}
                editOrderTypeId={details.editOrderTypeId}
                setEditOrderTypeId={details.setEditOrderTypeId}
                editScheduledDate={details.editScheduledDate}
                setEditScheduledDate={details.setEditScheduledDate}
                editMachineId={details.editMachineId}
                setEditMachineId={details.setEditMachineId}
                editPerformedId={details.editPerformedId}
                setEditPerformedId={details.setEditPerformedId}
                editDescription={details.editDescription}
                setEditDescription={details.setEditDescription}
                orderTypes={details.orderTypes}
                machines={details.machines}
                usersList={details.usersList}
                editChecklistTasks={details.editChecklistTasks}
                handleRemoveTaskInEdit={details.handleRemoveTaskInEdit}
                setIsAddChecklistModalOpen={details.setIsAddChecklistModalOpen}
              />
            ) : (
              <OrderExecutionView
                order={order}
                localOrderComments={details.localOrderComments}
                setLocalOrderComments={details.setLocalOrderComments}
                localChecklist={details.localChecklist}
                isExecutionAllowed={details.isExecutionAllowed}
                handleChecklistExecutionUpdate={details.handleChecklistExecutionUpdate}
              />
            )}
          </div>

          {/* Footer Actions */}
          {order && (
            <OrderFooter
              isEditMode={details.isEditMode}
              order={order}
              isExecutionAllowed={details.isExecutionAllowed}
              isSaving={details.isSaving}
              allItemsProcessed={details.allItemsProcessed}
              setIsEditMode={details.setIsEditMode}
              startOrder={details.startOrder}
              saveExecutionProgress={details.saveExecutionProgress}
            />
          )}
        </div>
      </div>

      {/* External Modal for Adding Tasks */}
      <AddChecklistItemsModal
        isOpen={details.isAddChecklistModalOpen}
        onClose={() => details.setIsAddChecklistModalOpen(false)}
        onAdd={details.handleAddTasksFromModal}
        machines={details.machines}
        orderTypes={details.orderTypes}
      />
    </>
  );
};