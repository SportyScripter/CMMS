import React from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { FailureDetailsModalProps } from "../../../types/failure";

import { PartSelectionModal } from "../PartSelectionModal";
import { PartInfoModal } from "../PartInfoModal";
import { StatusReasonModal } from "../StatusReasonModal";

import { useFailureDetails } from "./useFailureDetails";
import { FailureHeader } from "./components/FailureHeader";
import { FailureInfoGrid } from "./components/FailureInfoGrid";
import { SubmitterSection } from "./components/SubmitterSection";
import { ServiceActionButtons } from "./components/ServiceActionButtons";
import { ResolutionForm } from "./components/ResolutionForm";
import { ResolvedDetailsView } from "./components/ResolvedDetailsView";

export const FailureDetailsModal: React.FC<FailureDetailsModalProps> = ({
  failureId,
  isOpen,
  onClose,
  onUpdated,
}) => {
  const details = useFailureDetails({ failureId, isOpen, onClose, onUpdated });
  if (!isOpen || !details) return null;
  const failure = details.failure;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in duration-200">
        <FailureHeader
          failureId={failureId}
          canDeleteFailure={details.canDeleteFailure}
          isActionLoading={details.isActionLoading}
          onDelete={details.handleDeleteFailure}
          onClose={onClose}
        />

        <div className="p-6 overflow-y-auto flex-1 bg-white">
          {details.isLoading || !failure ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="space-y-6">
              {details.error && (
                <div className="p-3 text-sm text-red-700 bg-red-50 rounded-lg border border-red-100 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2" /> {details.error}
                </div>
              )}

              <FailureInfoGrid failure={failure} />

              <SubmitterSection
                failure={failure}
                isSubmitter={details.isSubmitter}
                isSubmitterEditing={details.isSubmitterEditing}
                setIsSubmitterEditing={details.setIsSubmitterEditing}
                isActionLoading={details.isActionLoading}
                handleDeleteFailure={details.handleDeleteFailure}
                handleSaveSubmitterEdit={details.handleSaveSubmitterEdit}
                editMachineId={details.editMachineId}
                setEditMachineId={details.setEditMachineId}
                editDepartmentId={details.editDepartmentId}
                setEditDepartmentId={details.setEditDepartmentId}
                editStatus={details.editStatus}
                setEditStatus={details.setEditStatus}
                editDescription={details.editDescription}
                setEditDescription={details.setEditDescription}
                machines={details.machines}
                departments={details.departments}
              />

              {!details.isResolving &&
                failure.status !== "RESOLVED" &&
                details.isService && (
                  <ServiceActionButtons
                    failure={failure}
                    isActionLoading={details.isActionLoading}
                    handleStatusChange={details.handleStatusChange}
                    setPendingStatus={details.setPendingStatus}
                    setIsReasonModalOpen={details.setIsReasonModalOpen}
                    setIsResolving={details.setIsResolving}
                  />
                )}

              {details.isResolving && details.isService && (
                <ResolutionForm
                  handleResolve={details.handleResolve}
                  repairDescription={details.repairDescription}
                  setRepairDescription={details.setRepairDescription}
                  isActionLoading={details.isActionLoading}
                  setIsResolving={details.setIsResolving}
                  usedParts={details.usedParts}
                  availableParts={details.availableParts}
                  setIsPartModalOpen={details.setIsPartModalOpen}
                  updatePartField={details.updatePartField}
                  removePartField={details.removePartField}
                />
              )}

              {failure.status === "RESOLVED" && !details.isResolving && (
                <ResolvedDetailsView
                  failure={failure}
                  isManager={details.isManager}
                  isService={details.isService}
                  setIsResolving={details.setIsResolving}
                  setSelectedPartForInfo={details.setSelectedPartForInfo}
                />
              )}
            </div>
          )}
        </div>
      </div>

      <StatusReasonModal
        isOpen={details.isReasonModalOpen}
        onClose={() => details.setIsReasonModalOpen(false)}
        onSubmit={details.handleReasonSubmit}
        statusType={details.pendingStatus}
        isLoading={details.isActionLoading}
      />

      {failure && (
        <PartSelectionModal
          isOpen={details.isPartModalOpen}
          onClose={() => details.setIsPartModalOpen(false)}
          onSelect={details.handleSelectPart}
          parts={details.availableParts}
          machineId={failure.machine_id}
        />
      )}

      <PartInfoModal
        isOpen={details.selectedPartForInfo !== null}
        part={details.selectedPartForInfo}
        onClose={() => details.setSelectedPartForInfo(null)}
      />
    </div>
  );
};
