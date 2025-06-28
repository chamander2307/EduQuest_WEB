// Mock data cho Student Exercise Detail
export const mockStudentExerciseDetail = {
  code: 2000,
  message: "Successfully retrieved student exercise details",
  data: {
    participationId: 1,
    exerciseId: 1,
    exerciseName: "Java Programming Quiz",
    studentName: "Nguyễn Văn A",
    studentCode: "SV001",
    studentEmail: "student1@example.com",
    score: 7.5,
    totalQuestions: 5,
    correctAnswers: 3,
    status: "SUBMITTED",
    startedAt: "2024-01-15T08:30:00",
    submittedAt: "2024-01-15T09:15:00",
    duration: 2730, // Duration in seconds (45 minutes 30 seconds)
    questions: [
      {
        questionId: 1,
        questionText: "Đâu là cách khai báo biến trong Java?",
        selectedOptionId: 2,
        correctOptionId: 2,
        explanation: "Trong Java, biến được khai báo với cú pháp: kiểu_dữ_liệu tên_biến = giá_trị;",
        options: [
          {
            optionId: 1,
            optionText: "var x = 10;"
          },
          {
            optionId: 2,
            optionText: "int x = 10;"
          },
          {
            optionId: 3,
            optionText: "x = 10;"
          },
          {
            optionId: 4,
            optionText: "let x = 10;"
          }
        ]
      },
      {
        questionId: 2,
        questionText: "Phương thức nào được gọi đầu tiên khi chạy chương trình Java?",
        selectedOptionId: 1,
        correctOptionId: 3,
        explanation: "Phương thức main() là điểm bắt đầu của chương trình Java.",
        options: [
          {
            optionId: 1,
            optionText: "start()"
          },
          {
            optionId: 2,
            optionText: "run()"
          },
          {
            optionId: 3,
            optionText: "main()"
          },
          {
            optionId: 4,
            optionText: "init()"
          }
        ]
      },
      {
        questionId: 3,
        questionText: "Từ khóa nào được sử dụng để kế thừa trong Java?",
        selectedOptionId: null,
        correctOptionId: 2,
        explanation: "Từ khóa 'extends' được sử dụng để một class kế thừa từ class khác.",
        options: [
          {
            optionId: 1,
            optionText: "implements"
          },
          {
            optionId: 2,
            optionText: "extends"
          },
          {
            optionId: 3,
            optionText: "inherits"
          },
          {
            optionId: 4,
            optionText: "super"
          }
        ]
      },
      {
        questionId: 4,
        questionText: "Kiểu dữ liệu nào sau đây là kiểu nguyên thủy trong Java?",
        selectedOptionId: 3,
        correctOptionId: 1,
        explanation: "int là kiểu dữ liệu nguyên thủy, còn String là kiểu dữ liệu đối tượng.",
        options: [
          {
            optionId: 1,
            optionText: "int"
          },
          {
            optionId: 2,
            optionText: "String"
          },
          {
            optionId: 3,
            optionText: "Integer"
          },
          {
            optionId: 4,
            optionText: "Array"
          }
        ]
      },
      {
        questionId: 5,
        questionText: "Cách nào đúng để tạo một mảng trong Java?",
        selectedOptionId: 4,
        correctOptionId: 4,
        explanation: "Trong Java, mảng có thể được tạo bằng cú pháp int[] arr = new int[5];",
        options: [
          {
            optionId: 1,
            optionText: "int arr[5];"
          },
          {
            optionId: 2,
            optionText: "array int[5] arr;"
          },
          {
            optionId: 3,
            optionText: "int arr = new int[5];"
          },
          {
            optionId: 4,
            optionText: "int[] arr = new int[5];"
          }
        ]
      }
    ]
  }
};
