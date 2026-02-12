package com.example.demo.service;

import com.example.demo.dto.TaskDTO;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.model.Task;
import com.example.demo.model.User;
import com.example.demo.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TaskService {
    
    @Autowired
    private TaskRepository taskRepository;
    
    @Autowired
    private UserDetailsService userDetailsService;
    
    public List<Task> getUserTasks() {
        User user = getCurrentUser();
        return taskRepository.findByUser(user);
    }
    
    public Task getTaskById(Long id) {
        User user = getCurrentUser();
        return taskRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Tâche non trouvée avec l'id : " + id));
    }
    
    public Task createTask(TaskDTO taskDTO) {
        User user = getCurrentUser();
        
        Task task = new Task();
        task.setTitle(taskDTO.getTitle());
        task.setDescription(taskDTO.getDescription());
        task.setCompleted(taskDTO.isCompleted());
        task.setUser(user);
        
        return taskRepository.save(task);
    }
    
    public Task updateTask(Long id, TaskDTO taskDTO) {
        User user = getCurrentUser();
        Task task = taskRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Tâche non trouvée avec l'id : " + id));
        
        task.setTitle(taskDTO.getTitle());
        task.setDescription(taskDTO.getDescription());
        task.setCompleted(taskDTO.isCompleted());
        
        return taskRepository.save(task);
    }
    
    public void deleteTask(Long id) {
        User user = getCurrentUser();
        Task task = taskRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Tâche non trouvée avec l'id : " + id));
        
        taskRepository.delete(task);
    }
    
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        return (User) userDetailsService.loadUserByUsername(username);
    }
}
