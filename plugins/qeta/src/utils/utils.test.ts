import { Filters } from '../components/QuestionsContainer/FilterPanel';
import {
  FiltersWithDateRange,
  formatDate,
  getFiltersWithDateRange,
  removeMarkdownFormatting,
  truncate,
} from './utils';

describe('truncate', () => {
  it('should truncate a long string and add three dots at the end', () => {
    const input = 'This is a long string';
    const expectedOutput = 'This is a...';
    expect(truncate(input, 10)).toBe(expectedOutput);
  });

  it('should return the original string if shorter than the length', () => {
    const input = 'This is a long string';
    const expectedOutput = 'This is a long string';
    expect(truncate(input, 25)).toBe(expectedOutput);
  });
});

describe('removeMarkdownFormatting', () => {
  it('should remove HTML tags', () => {
    const input = '<h1>Hello, world!</h1>';
    const expectedOutput = 'Hello, world!';
    expect(removeMarkdownFormatting(input)).toBe(expectedOutput);
  });

  it('should remove nested HTML tags', () => {
    const input = '<div class="test"><h1>Hello, world!</h1></div>';
    const expectedOutput = 'Hello, world!';
    expect(removeMarkdownFormatting(input)).toBe(expectedOutput);
  });

  it('should handle inline code blocks', () => {
    const input = '`console.log("test")`';
    const expectedOutput = 'console.log("test")';
    expect(removeMarkdownFormatting(input)).toBe(expectedOutput);
  });

  it('should handle code blocks defined using ```', () => {
    const input = `\`\`\`
    echo "Hello world!"
    \`\`\`
    `;
    const expectedOutput = 'echo "Hello world!"';
    expect(removeMarkdownFormatting(input)).toBe(expectedOutput);
  });

  it('should handle code blocks defined using ``` and a language', () => {
    const input = `\`\`\`bash
    echo "Hello world!"
    \`\`\`
    `;
    const expectedOutput = 'echo "Hello world!"';
    expect(removeMarkdownFormatting(input)).toBe(expectedOutput);
  });

  // Spaces for indentation are kept.
  it('should handle indented code blocks', () => {
    const input = `\`\`\`python
    def main():
        print("Hello")
        print("World!")
    \`\`\`
    `;
    const expectedOutput =
      'def main():         print("Hello")         print("World!")';
    expect(removeMarkdownFormatting(input)).toBe(expectedOutput);
  });

  it('should remove the formatting for bold text', () => {
    const input = '**this is bold**';
    const expectedOutput = 'this is bold';
    expect(removeMarkdownFormatting(input)).toBe(expectedOutput);
  });

  it('should remove the formatting for italic text', () => {
    const input = '*this is italic*';
    const expectedOutput = 'this is italic';
    expect(removeMarkdownFormatting(input)).toBe(expectedOutput);
  });

  it('should remove the formatting for italic bold text', () => {
    const input = '***this is italic and bold***';
    const expectedOutput = 'this is italic and bold';
    expect(removeMarkdownFormatting(input)).toBe(expectedOutput);
  });

  it('should remove the formatting for strikethrough', () => {
    const input = '~~this has a strikethrough~~';
    const expectedOutput = 'this has a strikethrough';
    expect(removeMarkdownFormatting(input)).toBe(expectedOutput);
  });

  it('should remove the formatting for blockquotes', () => {
    const input = ['> First', '>> Nested', '>>> Nested', '> Second'];

    const expectedOutput = 'First Nested Nested Second';
    expect(removeMarkdownFormatting(input.join('\n'))).toBe(expectedOutput);
  });

  it('should remove the formatting for unordered lists', () => {
    const inputStar = ['* First', '* Second', '* Third'];
    const inputDash = ['- First', '- Second', '- Third'];

    const expectedOutput = 'First Second Third';
    expect(removeMarkdownFormatting(inputStar.join('\n'))).toBe(expectedOutput);
    expect(removeMarkdownFormatting(inputDash.join('\n'))).toBe(expectedOutput);
  });

  it('should remove the formatting for ordered lists', () => {
    const input = ['1. First', '2. Second', '3. Third'];

    const expectedOutput = 'First Second Third';
    expect(removeMarkdownFormatting(input.join('\n'))).toBe(expectedOutput);
  });

  it('should remove the formatting for images and keep the alt text', () => {
    const input = '![image of a cat](https://cat.png)';

    const expectedOutput = 'image of a cat';
    expect(removeMarkdownFormatting(input)).toBe(expectedOutput);
  });

  it('should remove the formatting for links and keep the description', () => {
    const input = '[some link to an image](https://cat.png)';

    const expectedOutput = 'some link to an image';
    expect(removeMarkdownFormatting(input)).toBe(expectedOutput);
  });

  it('should remove headers', () => {
    const headers = [
      '# Header',
      '## Header',
      '### Header',
      '#### Header',
      '#### Header',
      '##### Header',
      '###### Header',
    ];

    const expectedOutput = 'Header';

    headers.forEach(header => {
      expect(removeMarkdownFormatting(header)).toBe(expectedOutput);
    });
  });

  it('should remove footnotes', () => {
    const input = ['Note[^1]', '[^1]: Reference'];

    const expectedOutput = 'Note';
    expect(removeMarkdownFormatting(input.join('\n'))).toBe(expectedOutput);
  });

  it('should remove newlines and leading/trailing spaces', () => {
    const input = [
      '   ',
      '# Header',
      '\n',
      '![image of a cat](https://cat.png)',
      '\r\n',
      '* Item1',
      '* Item2',
      '* Item3',
      '\r',
      '`some code`  ',
    ];

    const expectedOutput =
      'Header   image of a cat   Item1 Item2 Item3  some code';
    expect(removeMarkdownFormatting(input.join('\n'))).toBe(expectedOutput);
  });
});

describe('formatDate', () => {
  it('should format the date to YYYY-MM-DD format', () => {
    const date = new Date(2024, 4, 30); // Month is zero index
    expect(formatDate(date)).toBe('2024-05-30');
  });
});

describe('getFiltersWithDateRange', () => {
  const filters: Filters = {
    order: 'desc',
    orderBy: 'created',
    noAnswers: 'false',
    noCorrectAnswer: 'false',
    noVotes: 'false',
    searchQuery: '',
    entity: '',
    tags: [],
    dateRange: '7-days',
  };
  const CurrentDate = Date;
  beforeEach(() => {
    const mockDate = new Date(1717047504106);
    jest.spyOn(global, 'Date').mockImplementation(date => {
      return date ? new CurrentDate(date) : mockDate;
    });
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('should add 7-days date range filter to filters', () => {
    filters.dateRange = '7-days';
    const expectedVal: FiltersWithDateRange = {
      ...filters,
      fromDate: '2024-05-24',
      toDate: '2024-05-30',
    };
    delete expectedVal.dateRange;
    expect(getFiltersWithDateRange(filters)).toMatchObject(expectedVal);
  });
  it('should add 30-days date range filter to filters', () => {
    filters.dateRange = '30-days';
    const expectedVal: FiltersWithDateRange = {
      ...filters,
      fromDate: '2024-05-01',
      toDate: '2024-05-30',
    };
    delete expectedVal.dateRange;
    expect(getFiltersWithDateRange(filters)).toMatchObject(expectedVal);
  });
  it('should add custom date range filter to filters', () => {
    filters.dateRange = '2024-05-01--2024-05-25';
    const expectedVal: FiltersWithDateRange = {
      ...filters,
      fromDate: '2024-05-01',
      toDate: '2024-05-25',
    };
    delete expectedVal.dateRange;
    expect(getFiltersWithDateRange(filters)).toMatchObject(expectedVal);
  });
  it('should add not date range filter to filters', () => {
    filters.dateRange = '';
    const expectedVal: Filters = {
      ...filters,
    };
    delete expectedVal.dateRange;
    expect(getFiltersWithDateRange(filters)).toMatchObject(expectedVal);
  });
});
