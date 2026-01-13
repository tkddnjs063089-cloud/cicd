import { Test, TestingModule } from '@nestjs/testing';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { mock } from 'node:test';
import { create } from 'domain';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Student } from './entities/student.entity';
import fc from 'fast-check';

describe('StudentsService', () => {
  let service: StudentsService;
  let mockRepo: any;

  // 테스트하기 전의 세팅 작업
  beforeEach(async () => {
    mockRepo = {
      create: jest.fn(),
      save: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudentsService,
        { provide: getRepositoryToken(Student), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<StudentsService>(StudentsService);
  });

  it('학생 생성 테스트(create)', async () => {
    const createDto = {
      name: '이영철',
      email: 'young40@naver.com',
      age: 27,
    };
    mockRepo.create.mockReturnValue(createDto); //create 함수가 실행되면 createDto를 반환하도록 설정
    mockRepo.save.mockResolvedValue({ ...createDto, id: 1, isActive: true }); // save 함수가 실행되면 promise 성공 케이스 돌려줌

    const result = await service.create(createDto);

    expect(result).toEqual({ ...createDto, id: 1, isActive: true });
    expect(mockRepo.create).toHaveBeenCalledWith(createDto);
    expect(mockRepo.save).toHaveBeenCalledWith(createDto);
  });
  it('학생 생성 테스트 - 패스트 체크 버전', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          name: fc.string({ minLength: 1, maxLength: 50 }),
          email: fc.emailAddress(),
          age: fc.integer({ min: 0 }),
        }),
        async (createDto) => {
          mockRepo.create.mockReturnValue(createDto);
          mockRepo.save.mockResolvedValue({
            ...createDto,
            id: 1,
            isActive: true,
          });

          const result = await service.create(createDto);

          expect(result).toHaveProperty('id');
          expect(result).toHaveProperty('isActive');
          expect(result.name).toBe(createDto.name);
          expect(result.email).toBe(createDto.email);
          expect(result.age).toBe(createDto.age);
          expect(mockRepo.create).toHaveBeenCalledWith(createDto);
        },
      ),
    );
  });
});
