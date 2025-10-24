import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { useCreateBookPostMutation } from "../../mutations";
import { BookInfo } from "../../types";
import { BookSellForm } from ".";

// Mock dependencies
jest.mock("../../mutations");
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />,
}));

// Mock alert
global.alert = jest.fn();

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => "mock-url");
global.URL.revokeObjectURL = jest.fn();

describe("BookSellForm", () => {
  const mockMutate = jest.fn();
  const mockBookInfo: BookInfo = {
    isbn: "9788960771234",
    title: "클린 코드",
    description: "애자일 소프트웨어 장인 정신",
    author: "로버트 C. 마틴",
    publisher: "인사이트",
    image: "https://example.com/book.jpg",
    pubdate: "20131224",
    link: "sample link",
    discount: "6000",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useCreateBookPostMutation as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });
  });

  describe("초기 렌더링", () => {
    it("컴포넌트가 정상적으로 렌더링된다", () => {
      render(<BookSellForm bookInfo={mockBookInfo} />);

      expect(screen.getByText("중고책 판매글 작성")).toBeInTheDocument();
      expect(
        screen.getByText("판매할 책의 정보를 정확하게 입력해주세요.")
      ).toBeInTheDocument();
    });

    it("선택된 책 정보가 표시된다", () => {
      render(<BookSellForm bookInfo={mockBookInfo} />);

      expect(screen.getByText("클린 코드")).toBeInTheDocument();
      expect(screen.getByText("로버트 C. 마틴 저")).toBeInTheDocument();
      expect(screen.getByAltText("클린 코드")).toHaveAttribute(
        "src",
        "https://example.com/book.jpg"
      );
    });

    it("모든 폼 필드가 표시된다", () => {
      render(<BookSellForm bookInfo={mockBookInfo} />);

      expect(screen.getByLabelText("게시글 제목")).toBeInTheDocument();
      expect(screen.getByLabelText("판매 가격 (원)")).toBeInTheDocument();
      expect(screen.getByLabelText("지역 (시/도)")).toBeInTheDocument();
      expect(screen.getByLabelText("지역 (시/군/구)")).toBeInTheDocument();
      expect(screen.getByLabelText(/책 상태 이미지/)).toBeInTheDocument();
      expect(screen.getByLabelText("상세 내용")).toBeInTheDocument();
    });

    it("제출 버튼이 활성화되어 있다", () => {
      render(<BookSellForm bookInfo={mockBookInfo} />);

      const submitButton = screen.getByRole("button", {
        name: "판매글 등록하기",
      });
      expect(submitButton).toBeEnabled();
    });
  });

  describe("폼 입력 validation", () => {
    it("빈 폼 제출 시 에러 메시지가 표시된다", async () => {
      const user = userEvent.setup();
      render(<BookSellForm bookInfo={mockBookInfo} />);

      const submitButton = screen.getByRole("button", {
        name: "판매글 등록하기",
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("제목을 입력해주세요.")).toBeInTheDocument();
        expect(screen.getByText("가격을 입력해주세요.")).toBeInTheDocument();
        expect(screen.getByText("시/도를 선택해주세요.")).toBeInTheDocument();
      });
    });

    it("제목이 2자 미만일 때 에러 메시지가 표시된다", async () => {
      const user = userEvent.setup();
      render(<BookSellForm bookInfo={mockBookInfo} />);

      const titleInput =
        screen.getByPlaceholderText("판매글 제목을 입력하세요");
      await user.type(titleInput, "a");
      await user.tab(); // blur 이벤트 발생

      await waitFor(() => {
        expect(
          screen.getByText("제목은 최소 2자 이상이어야 합니다.")
        ).toBeInTheDocument();
      });
    });

    it("가격이 0 이하일 때 에러 메시지가 표시된다", async () => {
      const user = userEvent.setup();
      render(<BookSellForm bookInfo={mockBookInfo} />);

      const priceInput = screen.getByPlaceholderText("숫자만 입력");
      await user.type(priceInput, "0");
      await user.tab();

      await waitFor(() => {
        expect(
          screen.getByText("가격은 1원 이상이어야 합니다.")
        ).toBeInTheDocument();
      });
    });

    it("상세 내용이 10자 미만일 때 에러 메시지가 표시된다", async () => {
      const user = userEvent.setup();
      render(<BookSellForm bookInfo={mockBookInfo} />);

      const contentTextarea = screen.getByPlaceholderText(
        "책의 상태, 거래 방식 등 상세한 내용을 작성해주세요."
      );
      await user.type(contentTextarea, "짧은글");
      await user.tab();

      await waitFor(() => {
        expect(
          screen.getByText("내용은 최소 10자 이상이어야 합니다.")
        ).toBeInTheDocument();
      });
    });
  });

  describe("지역 선택", () => {
    it("시/도 선택 시 시/군/구 select가 활성화된다", async () => {
      const user = userEvent.setup();
      render(<BookSellForm bookInfo={mockBookInfo} />);

      const citySelect = screen.getByRole("combobox", { name: "지역 (시/도)" });
      const districtSelect = screen.getByRole("combobox", {
        name: "지역 (시/군/구)",
      });

      expect(districtSelect).toBeDisabled();

      await user.click(citySelect);
      const seoulOption = await screen.findByText("서울특별시");
      await user.click(seoulOption);

      await waitFor(() => {
        expect(districtSelect).toBeEnabled();
      });
    });

    it("시/도 변경 시 시/군/구가 초기화된다", async () => {
      const user = userEvent.setup();
      render(<BookSellForm bookInfo={mockBookInfo} />);

      const citySelect = screen.getByRole("combobox", { name: "지역 (시/도)" });

      // 첫 번째 시/도 선택
      await user.click(citySelect);
      const seoulOption = await screen.findByText("서울특별시");
      await user.click(seoulOption);

      // 시/군/구 선택
      const districtSelect = screen.getByRole("combobox", {
        name: "지역 (시/군/구)",
      });
      await user.click(districtSelect);
      const gangnamOption = await screen.findByText("강남구");
      await user.click(gangnamOption);

      // 다른 시/도로 변경
      await user.click(citySelect);
      const busanOption = await screen.findByText("부산광역시");
      await user.click(busanOption);

      // 시/군/구가 초기화되었는지 확인
      await waitFor(() => {
        expect(screen.queryByText("강남구")).not.toBeInTheDocument();
      });
    });
  });

  describe("이미지 업로드", () => {
    it("이미지를 업로드하면 미리보기가 표시된다", async () => {
      render(<BookSellForm bookInfo={mockBookInfo} />);

      const file = new File(["image"], "test.png", { type: "image/png" });
      const input = screen.getByLabelText(/이미지 추가/);

      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(screen.getByAltText("Preview 0")).toBeInTheDocument();
        expect(screen.getByText("책 상태 이미지 (1 / 5)")).toBeInTheDocument();
      });
    });

    it("여러 이미지를 업로드할 수 있다", async () => {
      render(<BookSellForm bookInfo={mockBookInfo} />);

      const files = [
        new File(["image1"], "test1.png", { type: "image/png" }),
        new File(["image2"], "test2.png", { type: "image/png" }),
      ];
      const input = screen.getByLabelText(/이미지 추가/);

      fireEvent.change(input, { target: { files } });

      await waitFor(() => {
        expect(screen.getByAltText("Preview 0")).toBeInTheDocument();
        expect(screen.getByAltText("Preview 1")).toBeInTheDocument();
        expect(screen.getByText("책 상태 이미지 (2 / 5)")).toBeInTheDocument();
      });
    });

    it("5개 초과 업로드 시 alert가 표시된다", async () => {
      render(<BookSellForm bookInfo={mockBookInfo} />);

      const files = Array.from(
        { length: 6 },
        (_, i) => new File([`image${i}`], `test${i}.png`, { type: "image/png" })
      );
      const input = screen.getByLabelText(/이미지 추가/);

      fireEvent.change(input, { target: { files } });

      await waitFor(() => {
        expect(global.alert).toHaveBeenCalledWith(
          "이미지는 최대 5개까지 첨부할 수 있습니다."
        );
      });
    });

    it("이미지 삭제 버튼을 클릭하면 이미지가 제거된다", async () => {
      const user = userEvent.setup();
      render(<BookSellForm bookInfo={mockBookInfo} />);

      const file = new File(["image"], "test.png", { type: "image/png" });
      const input = screen.getByLabelText(/이미지 추가/);

      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(screen.getByAltText("Preview 0")).toBeInTheDocument();
      });

      const deleteButton = screen.getByRole("button", { name: "" });
      await user.click(deleteButton);

      await waitFor(() => {
        expect(screen.queryByAltText("Preview 0")).not.toBeInTheDocument();
        expect(screen.getByText("책 상태 이미지 (0 / 5)")).toBeInTheDocument();
      });
    });

    it("5개 업로드 후 이미지 추가 버튼이 숨겨진다", async () => {
      render(<BookSellForm bookInfo={mockBookInfo} />);

      const files = Array.from(
        { length: 5 },
        (_, i) => new File([`image${i}`], `test${i}.png`, { type: "image/png" })
      );
      const input = screen.getByLabelText(/이미지 추가/);

      fireEvent.change(input, { target: { files } });

      await waitFor(() => {
        expect(screen.queryByLabelText(/이미지 추가/)).not.toBeInTheDocument();
        expect(screen.getByText("책 상태 이미지 (5 / 5)")).toBeInTheDocument();
      });
    });
  });

  describe("폼 제출", () => {
    it("유효한 데이터로 제출 시 mutate가 호출된다", async () => {
      const user = userEvent.setup();
      render(<BookSellForm bookInfo={mockBookInfo} />);

      // 제목 입력
      await user.type(
        screen.getByPlaceholderText("판매글 제목을 입력하세요"),
        "클린 코드 팝니다"
      );

      // 가격 입력
      await user.type(screen.getByPlaceholderText("숫자만 입력"), "15000");

      // 지역 선택
      const citySelect = screen.getByRole("combobox", { name: "지역 (시/도)" });
      await user.click(citySelect);
      await user.click(await screen.findByText("서울특별시"));

      const districtSelect = screen.getByRole("combobox", {
        name: "지역 (시/군/구)",
      });
      await user.click(districtSelect);
      await user.click(await screen.findByText("강남구"));

      // 상세 내용 입력
      await user.type(
        screen.getByPlaceholderText(
          "책의 상태, 거래 방식 등 상세한 내용을 작성해주세요."
        ),
        "깨끗한 상태입니다. 직거래 가능합니다."
      );

      // 이미지 업로드
      const file = new File(["image"], "test.png", { type: "image/png" });
      const imageInput = screen.getByLabelText(/이미지 추가/);
      fireEvent.change(imageInput, { target: { files: [file] } });

      // 제출
      const submitButton = screen.getByRole("button", {
        name: "판매글 등록하기",
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledWith({
          imageFiles: [file],
          payload: {
            title: "클린 코드 팝니다",
            price: "15000",
            city: "서울특별시",
            district: "강남구",
            content: "깨끗한 상태입니다. 직거래 가능합니다.",
            book: mockBookInfo,
          },
        });
      });
    });

    it("제출 중일 때 버튼이 비활성화되고 로딩 표시가 나타난다", () => {
      (useCreateBookPostMutation as jest.Mock).mockReturnValue({
        mutate: mockMutate,
        isPending: true,
      });

      render(<BookSellForm bookInfo={mockBookInfo} />);

      const submitButton = screen.getByRole("button", {
        name: /판매글 등록하기/,
      });

      expect(submitButton).toBeDisabled();
      expect(screen.getByRole("button").querySelector("svg")).toHaveClass(
        "animate-spin"
      );
    });
  });

  describe("접근성", () => {
    it("모든 입력 필드에 label이 연결되어 있다", () => {
      render(<BookSellForm bookInfo={mockBookInfo} />);

      expect(screen.getByLabelText("게시글 제목")).toBeInTheDocument();
      expect(screen.getByLabelText("판매 가격 (원)")).toBeInTheDocument();
      expect(screen.getByLabelText("상세 내용")).toBeInTheDocument();
    });

    it("에러 메시지가 aria-live 영역에 표시된다", async () => {
      const user = userEvent.setup();
      render(<BookSellForm bookInfo={mockBookInfo} />);

      const submitButton = screen.getByRole("button", {
        name: "판매글 등록하기",
      });
      await user.click(submitButton);

      await waitFor(() => {
        const errorMessages = screen.getAllByRole("alert", { hidden: true });
        expect(errorMessages.length).toBeGreaterThan(0);
      });
    });
  });
});
