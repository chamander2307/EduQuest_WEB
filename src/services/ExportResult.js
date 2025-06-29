import instance from "../config/axios";

export const exportStudentScoresToExcel = async (classId, exerciseId) => {
  try {
    const response = await instance.get(
      `exercises/classes/${classId}/exercises/${exerciseId}/export-scores`,
      {
        responseType: "blob", 
      }
    );

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "scores.xlsx");
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    throw new Error("Xuất file Excel thất bại!");
  }
};