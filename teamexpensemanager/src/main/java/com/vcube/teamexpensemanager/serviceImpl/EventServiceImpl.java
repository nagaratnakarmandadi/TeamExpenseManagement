package com.vcube.teamexpensemanager.serviceImpl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.vcube.teamexpensemanager.dto.EventRequest;
import com.vcube.teamexpensemanager.entity.Event;
import com.vcube.teamexpensemanager.entity.User;
import com.vcube.teamexpensemanager.exceptions.ResourceNotFoundException;
import com.vcube.teamexpensemanager.repository.EventRepository;
import com.vcube.teamexpensemanager.repository.UserRepository;
import com.vcube.teamexpensemanager.service.EventService;

@Service
public class EventServiceImpl implements EventService {

	@Autowired
	EventRepository eventRepo;

	@Autowired
	UserRepository userRepo;

	@Override
	public Event createEvent(EventRequest request) {

		Event event = new Event();
		event.setEventName(request.eventName());
		event.setLocation(request.location());
		return eventRepo.save(event);
	}

	@Override
	public List<Event> getAllEvents() {
		return eventRepo.findAll();
	}

	@Override
	public Event getEventById(Long id) {
		return eventRepo.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Event with ID " + id + " not found"));
	}

	@Override
	public Event addMember(Long eventId, Long userId) {

		Event event = getEventById(eventId);
		User user = userRepo.findById(userId)
				.orElseThrow(() -> new ResourceNotFoundException("User with ID " + userId + " not found"));

		event.getMembers().add(user);
		return eventRepo.save(event);
	}

	@Override
	public Event removeMember(Long eventId, Long userId) {

		Event event = getEventById(eventId);

		User user = userRepo.findById(userId)
				.orElseThrow(() -> new ResourceNotFoundException("User with ID " + userId + " not found"));
		event.getMembers().remove(user);
		return eventRepo.save(event);
	}

}
